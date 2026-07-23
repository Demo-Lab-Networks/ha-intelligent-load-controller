"""Home Assistant application boundary for one configured electrical site.

This module intentionally contains orchestration and persistence only. Device
actions are introduced through adapters after a planner/arbitrator decision;
the methods here never execute an actuator merely because Home Assistant has
started, reloaded, or received a preview request.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from datetime import time as local_time
from decimal import Decimal
from math import isfinite
from types import MappingProxyType
from typing import Any
from zoneinfo import ZoneInfo

from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_state_change_event

from .adapters import AdapterCommand, AdapterFeedback, LoadAdapter, NullAdapter, create_adapter
from .const import (
    DEFAULT_DECISION_JOURNAL_LIMIT,
    DOMAIN,
    LOAD_SUBENTRY_TYPE,
    UPDATE_SIGNAL,
)
from .controller import (
    ArbitrationInput,
    CommandAction,
    CommandProposal,
    CommandSource,
    DeterministicPlanner,
    LearningPolicy,
    LearningSample,
    LearningState,
    LoadRequest,
    PlanningInput,
    PriceInterval,
    PriceUnit,
    ReasonCode,
    ScheduleBoundary,
    ScheduleWindow,
    SiteArbitrator,
    SiteConfigV1,
    SitePowerSnapshot,
    SolarAction,
    SolarPolicy,
    SolarQualificationState,
    TariffTimeline,
    authorize_command,
    evaluate_solar,
    is_active_at,
    normalize_price,
    resolve_local_datetime,
    set_learning_frozen,
    update_learning,
)
from .repairs import (
    async_create_configuration_issue,
    async_create_runtime_issue,
    async_delete_issue,
)
from .schema import (
    ConfigurationValidationError,
    ValidationIssue,
    configuration_schema,
    duplicate_actuator_binding_load_ids,
    serialize_issues,
    validate_load_config,
    validate_site_config,
    validate_unique_actuator_bindings,
)
from .storage import RuntimeStore


class ConfigConflictError(RuntimeError):
    """Raised when a client tries to overwrite a newer configuration revision."""


class LoadNotFoundError(LookupError):
    """Raised when a load UUID does not belong to this site."""


_REDACTED_ACTUATOR_FAILURE_MESSAGE = (
    "The configured actuator was unavailable or did not complete the requested operation."
)


@dataclass(frozen=True, slots=True)
class OverrideRequest:
    """A validated manual operation request, expressed as absolute wall time."""

    desired_state: str
    expires_at: datetime | None
    indefinite: bool


class SiteCoordinator:
    """Own mutable integration runtime for a single site config entry."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, store: RuntimeStore) -> None:
        self.hass = hass
        self.entry = entry
        self._store = store
        self._lock = asyncio.Lock()
        self._started = False
        self._recovery: dict[str, Any] = {}
        self._last_plan: dict[str, Any] | None = None
        self._last_replan_at: datetime | None = None
        self._planner = DeterministicPlanner()
        self._arbitrator = SiteArbitrator()
        self._adapters: dict[str, LoadAdapter] = {}
        self._feedback: dict[str, AdapterFeedback] = {}
        self._conflicting_actuator_load_ids: set[str] = set()
        self._observation_ready = False
        self._unsub_input_events: list[Callable[[], None]] = []
        self._replan_task: asyncio.Task[None] | None = None
        self._actuator_test_tasks: dict[str, asyncio.Task[None]] = {}

    async def async_start(self) -> None:
        """Restore bounded state and enter observation-only stabilisation."""

        async with self._lock:
            self._recovery = self._store.get_site(self.entry.entry_id)
            self._recovery.setdefault("overrides", {})
            self._recovery.setdefault("load_runtime", {})
            self._recovery.setdefault("decision_journal", [])
            self._recovery.setdefault("learning", {})
            self._recovery.setdefault("daily_summaries", {})
            interrupted_tests = self._recovery.pop("actuator_tests", {})
            if isinstance(interrupted_tests, Mapping):
                for load_id in interrupted_tests:
                    self._record_decision(
                        "fault",
                        "manual_actuator_test_interrupted",
                        (
                            "A bounded manual actuator test was interrupted by restart; "
                            "no output was changed during recovery."
                        ),
                        load_id=str(load_id),
                    )
            self._last_plan = self._recovery.get("last_plan")
            # Absolute expiry survives restarts.  Expired records are removed
            # during recovery, before normal evaluation can see them.
            self._active_overrides(purge_expired=True)
            self._sync_adapters()
            self._refresh_configuration_issue()
            await self._async_observe_locked()
            self._subscribe_input_events()
            self._observation_ready = self._site_snapshot().available
            self._started = True
            self._record_decision(
                "initialising", "restart_stabilisation", "Observed state before control is enabled."
            )
            await self._async_persist_locked()
        self._notify_update()
        # A separate task keeps setup observation-first.  Do not even schedule
        # an automatic evaluation until the required hard limit and grid input
        # are already valid; this also keeps incomplete setup entirely quiet.
        if self._observation_ready and self._core_site_config() is not None:
            self._schedule_replan("startup")

    async def async_stop(self) -> None:
        """Persist recovery state without issuing a device action."""

        async with self._lock:
            self._started = False
            self._observation_ready = False
            for unsubscribe in self._unsub_input_events:
                unsubscribe()
            self._unsub_input_events.clear()
            if self._replan_task is not None:
                self._replan_task.cancel()
                self._replan_task = None
            # A test is an explicit temporary operation.  If HA unloads while
            # one is active, issue its already-authorized explicit stop rather
            # than allowing a bounded test to become unbounded.
            for load_id, task in list(self._actuator_test_tasks.items()):
                task.cancel()
                adapter = self._adapters.get(load_id)
                if adapter is not None:
                    try:
                        feedback = await adapter.async_apply(
                            AdapterCommand(
                                desired_enabled=False,
                                source="manual_test",
                                reason_code="manual_actuator_test_unload",
                            )
                        )
                        self._feedback[load_id] = feedback
                        self._update_runtime_from_feedback(load_id, feedback)
                    except Exception:
                        self._record_decision(
                            "fault",
                            "actuator_unavailable",
                            _REDACTED_ACTUATOR_FAILURE_MESSAGE,
                            load_id=load_id,
                        )
            self._actuator_test_tasks.clear()
            self._recovery.pop("actuator_tests", None)
            await self._async_persist_locked()

    @property
    def site_config(self) -> dict[str, Any]:
        """Return normalized site configuration."""

        return validate_site_config(self.entry.options or {})

    @property
    def config_revision(self) -> int:
        """Return the current site revision."""

        return int(self.site_config["config_revision"])

    def _load_configs(self) -> list[tuple[ConfigSubentry, dict[str, Any]]]:
        """Read normalized load configurations from current config subentries."""

        result: list[tuple[ConfigSubentry, dict[str, Any]]] = []
        for subentry in self.entry.subentries.values():
            if subentry.subentry_type != LOAD_SUBENTRY_TYPE:
                continue
            try:
                result.append((subentry, validate_load_config(subentry.data)))
            except ConfigurationValidationError as err:
                # Retain invalid legacy/subentry data for repair rather than silently acting on it.
                result.append(
                    (
                        subentry,
                        {
                            "load_id": None,
                            "display_name": subentry.title,
                            "invalid": serialize_issues(err),
                        },
                    )
                )
        return result

    def _validate_actuator_binding_ownership(
        self,
        candidate: Mapping[str, Any],
        *,
        exclude_load_id: str | None = None,
    ) -> None:
        """Reject a write that would give two loads authority over one target."""

        configured_loads = [
            config
            for _, config in self._load_configs()
            if not config.get("invalid") and config.get("load_id") != exclude_load_id
        ]
        configured_loads.append(dict(candidate))
        validate_unique_actuator_bindings(configured_loads)

    @staticmethod
    def _validate_preview_actuator_bindings(load_configs: Sequence[Mapping[str, Any]]) -> None:
        """Apply the same actuator-ownership rule to a staged preview only."""

        validate_unique_actuator_bindings(load_configs)

    def _sync_adapters(self) -> None:
        """Rebuild adapters from validated configuration without testing actions."""

        configs = self._load_configs()
        self._conflicting_actuator_load_ids = set(
            duplicate_actuator_binding_load_ids(
                config for _, config in configs if not config.get("invalid")
            )
        )
        active_ids: set[str] = set()
        for _, config in configs:
            load_id = config.get("load_id")
            if not isinstance(load_id, str):
                continue
            active_ids.add(load_id)
            if load_id in self._conflicting_actuator_load_ids:
                # Legacy/corrupt config can bypass the normal write guard. Do
                # not let either ambiguous load acquire a live adapter.
                self._adapters[load_id] = NullAdapter(self.hass, {})
            else:
                self._adapters[load_id] = create_adapter(self.hass, config)
        for load_id in set(self._adapters) - active_ids:
            self._adapters.pop(load_id, None)
            self._feedback.pop(load_id, None)

    def _refresh_configuration_issue(self) -> None:
        """Expose invalid or ambiguous actuator ownership without actuating."""

        invalid_loads = [config for _, config in self._load_configs() if config.get("invalid")]
        if invalid_loads or self._conflicting_actuator_load_ids:
            detail = "One or more load config-subentries do not pass the current safety schema."
            if self._conflicting_actuator_load_ids:
                detail = "Multiple loads declare the same actuator target."
            async_create_configuration_issue(self.hass, self.entry.entry_id, detail)
            return
        async_delete_issue(self.hass, f"configuration_{self.entry.entry_id}")

    async def _async_observe_locked(self) -> None:
        """Observe adapters before any future policy evaluation; never command here."""

        self._sync_adapters()
        for load_id, adapter in self._adapters.items():
            try:
                feedback = await adapter.async_observe()
            except Exception:  # Adapter failures are inputs, never command retries.
                self._record_decision(
                    "fault",
                    "actuator_unavailable",
                    _REDACTED_ACTUATOR_FAILURE_MESSAGE,
                    load_id=load_id,
                )
                async_create_runtime_issue(
                    self.hass, self.entry.entry_id, f"actuator_unavailable_{load_id}"
                )
                continue
            async_delete_issue(
                self.hass,
                f"actuator_unavailable_{load_id}_{self.entry.entry_id}",
            )
            self._feedback[load_id] = feedback
            self._update_runtime_from_feedback(load_id, feedback)
            if not feedback.available:
                async_create_runtime_issue(
                    self.hass, self.entry.entry_id, f"input_unavailable_{load_id}"
                )
            else:
                async_delete_issue(
                    self.hass,
                    f"input_unavailable_{load_id}_{self.entry.entry_id}",
                )

    def _subscribe_input_events(self) -> None:
        """Listen only to configured feedback/input entities and coalesce replans."""

        if self._unsub_input_events:
            return
        entity_ids = self._relevant_entity_ids()
        if not entity_ids:
            return

        def _on_state_change(event) -> None:
            self._schedule_replan("input_changed")

        self._unsub_input_events.append(
            async_track_state_change_event(self.hass, entity_ids, _on_state_change)
        )

    def _relevant_entity_ids(self) -> list[str]:
        config = self.site_config
        entity_ids = [
            config.get("grid_power_entity_id"),
            config.get("grid_import_entity_id"),
            config.get("grid_export_entity_id"),
            config.get("solar_power_entity_id"),
        ]
        entity_ids.extend((config.get("phase_power_entity_ids") or {}).values())
        battery = config.get("battery")
        if isinstance(battery, Mapping):
            entity_ids.extend(value for key, value in battery.items() if key.endswith("entity_id"))
        for _, load in self._load_configs():
            for section in (load.get("actuator"), load.get("feedback")):
                if not isinstance(section, Mapping):
                    continue
                for key, value in section.items():
                    if key.endswith("entity_id") and isinstance(value, str):
                        entity_ids.append(value)
        return sorted(
            {
                entity_id
                for entity_id in entity_ids
                if isinstance(entity_id, str) and "." in entity_id
            }
        )

    def _schedule_replan(self, reason: str) -> None:
        """Coalesce event storms while preserving immediate state-driven control."""

        if self._replan_task is not None and not self._replan_task.done():
            return

        async def _run() -> None:
            try:
                await asyncio.sleep(1)
                await self.async_replan(reason=reason)
            except asyncio.CancelledError:
                raise

        self._replan_task = self.hass.async_create_task(
            _run(), f"{DOMAIN}_replan_{self.entry.entry_id}"
        )

    def _number_state(self, entity_id: object) -> tuple[float | None, datetime | None]:
        """Return one numeric HA state without treating unavailable values as zero."""

        if not isinstance(entity_id, str):
            return None, None
        state = self.hass.states.get(entity_id)
        if state is None or state.state.lower() in {"unknown", "unavailable", "none"}:
            return None, None
        try:
            return float(state.state), state.last_updated.astimezone(UTC)
        except (TypeError, ValueError):
            return None, None

    def _site_snapshot(self, config: Mapping[str, Any] | None = None) -> SitePowerSnapshot:
        """Translate configured site sensors into one safe signed grid snapshot."""

        config = self.site_config if config is None else config
        now = datetime.now(UTC)
        stale_seconds = float(config.get("sensor_stale_seconds", 900))

        def is_fresh(observed_at: datetime | None) -> bool:
            return (
                observed_at is not None
                and max(0.0, (now - observed_at).total_seconds()) <= stale_seconds
            )

        net_value, net_at = self._number_state(config.get("grid_power_entity_id"))
        import_value, import_at = self._number_state(config.get("grid_import_entity_id"))
        export_value, export_at = self._number_state(config.get("grid_export_entity_id"))
        uses_net = isinstance(config.get("grid_power_entity_id"), str) and bool(
            config.get("grid_power_entity_id")
        )
        import_configured = isinstance(config.get("grid_import_entity_id"), str) and bool(
            config.get("grid_import_entity_id")
        )
        export_configured = isinstance(config.get("grid_export_entity_id"), str) and bool(
            config.get("grid_export_entity_id")
        )
        uses_split = not uses_net and (import_configured or export_configured)
        required_input_times: list[datetime | None] = []
        if uses_net and net_value is not None:
            grid_w = (
                net_value if config["grid_sign_convention"] == "import_positive" else -net_value
            )
            required_input_times.append(net_at)
            grid_available = is_fresh(net_at)
        elif uses_split and (
            (not import_configured or import_value is not None)
            and (not export_configured or export_value is not None)
        ):
            grid_w = (import_value or 0.0) - (export_value or 0.0)
            if import_configured:
                required_input_times.append(import_at)
            if export_configured:
                required_input_times.append(export_at)
            grid_available = all(is_fresh(observed_at) for observed_at in required_input_times)
        else:
            grid_w = 0.0
            grid_available = False
        solar_w, solar_at = self._number_state(config.get("solar_power_entity_id"))
        if not is_fresh(solar_at):
            solar_w = None
        battery = self._mapping_or_empty(config.get("battery"))
        battery_w, battery_at = self._number_state(battery.get("power_entity_id"))
        if not is_fresh(battery_at):
            battery_w = None
        phase_values: dict[str, float] = {}
        for phase, entity_id in (config.get("phase_power_entity_ids") or {}).items():
            value, phase_at = self._number_state(entity_id)
            if value is not None and is_fresh(phase_at):
                phase_values[str(phase)] = value
        input_ages = [
            max(0.0, (now - observed_at).total_seconds())
            for observed_at in required_input_times
            if observed_at is not None
        ]
        age_s = max(input_ages, default=stale_seconds + 1)
        return SitePowerSnapshot(
            at=now,
            grid_import_w=grid_w,
            solar_generation_w=solar_w,
            battery_power_w=battery_w,
            phase_import_w=phase_values,
            input_age_s=age_s,
            available=grid_available,
        )

    def _core_site_config(self, config: Mapping[str, Any] | None = None) -> SiteConfigV1 | None:
        """Build pure safety model only when a hard electrical limit is configured."""

        config = self.site_config if config is None else config
        hard = config.get("hard_import_limit_w")
        if not isinstance(hard, int | float) or hard <= 0:
            return None
        currency = getattr(self.hass.config, "currency", None) or "XXX"
        return SiteConfigV1(
            site_id=str(self.entry.data.get("site_id", self.entry.entry_id)),
            timezone=self.hass.config.time_zone,
            currency=str(currency),
            hard_import_limit_w=float(hard),
            soft_import_limit_w=self._as_positive(config.get("soft_import_limit_w")),
            controlled_import_limit_w=self._as_positive(config.get("max_controlled_power_w")),
            max_simultaneous_binary_loads=self._positive_int(
                config.get("max_simultaneous_binary_loads")
            ),
            phase_hard_limits_w={
                str(key): float(value)
                for key, value in (config.get("phase_limits_w") or {}).items()
            },
            start_stagger_s=float(config.get("start_stagger_seconds", 0)),
            schema_version=int(config.get("schema_version", 1)),
            revision=int(config.get("config_revision", 0)) + 1,
        )

    @staticmethod
    def _as_positive(value: object) -> float | None:
        if (
            not isinstance(value, bool)
            and isinstance(value, int | float)
            and isfinite(float(value))
            and value > 0
        ):
            return float(value)
        return None

    @staticmethod
    def _mapping_or_empty(value: object) -> dict[str, Any]:
        """Copy an untrusted persisted mapping into a typed safe read view."""

        if not isinstance(value, Mapping):
            return {}
        return {str(key): item for key, item in value.items()}

    def _recovery_mapping(self, key: str) -> dict[str, Any]:
        """Return a mutable recovery section, replacing a corrupt value safely."""

        value = self._recovery.get(key)
        if isinstance(value, dict):
            return value
        replacement: dict[str, Any] = {}
        self._recovery[key] = replacement
        return replacement

    def _recovery_list(self, key: str) -> list[Any]:
        """Return a mutable recovery list, replacing a corrupt value safely."""

        value = self._recovery.get(key)
        if isinstance(value, list):
            return value
        replacement: list[Any] = []
        self._recovery[key] = replacement
        return replacement

    def _schedule_windows(
        self, raw: object, *, default_kind: str = "schedule"
    ) -> tuple[ScheduleWindow, ...]:
        windows: list[ScheduleWindow] = []
        if not isinstance(raw, list):
            return ()
        for index, item in enumerate(raw):
            if not isinstance(item, Mapping):
                continue
            try:
                start = local_time.fromisoformat(str(item["start"]))
                end = local_time.fromisoformat(str(item["end"]))
                windows.append(
                    ScheduleWindow(
                        name=str(item.get("name", f"{default_kind}_{index}")),
                        weekdays=frozenset(int(day) for day in item.get("days", range(7))),
                        start=start,
                        end=end,
                        mandatory=bool(item.get("mandatory", item.get("kind") == "mandatory")),
                    )
                )
            except (KeyError, TypeError, ValueError):
                continue
        return tuple(windows)

    def _tariff_timeline(
        self, now: datetime, config: Mapping[str, Any] | None = None
    ) -> TariffTimeline:
        """Build a local tariff timeline from configured HA/local sources.

        V1 intentionally consumes only fixed settings and Home Assistant state
        attributes.  It does not contact a retailer or cloud API.  Missing or
        stale prices become an explicit empty/gapped timeline, which prevents a
        cost-only request from looking artificially cheap.
        """

        config = self.site_config if config is None else config
        horizon_end = now + timedelta(hours=int(config.get("planning_horizon_hours", 24)))
        export_price = self._configured_export_price(config)
        future = self._future_price_intervals(now, horizon_end, config, export_price)
        mode = str(config.get("tariff_mode", "fixed"))
        if future and mode in {"future_entity", "hybrid"}:
            try:
                return TariffTimeline(tuple(future))
            except ValueError:
                return TariffTimeline(())
        if mode == "future_entity":
            # A configured future-price feed that is absent, stale, malformed,
            # or gapped must not silently become a fictitious flat tariff.
            return TariffTimeline(())
        if mode in {"tou", "hybrid"}:
            tou = self._tou_price_intervals(now, horizon_end, config, export_price)
            if tou:
                try:
                    return TariffTimeline(tuple(tou))
                except ValueError:
                    return TariffTimeline(())
        import_price = self._configured_import_price(config)
        if import_price is None:
            return TariffTimeline(())
        return TariffTimeline(
            (
                PriceInterval(
                    start_at=now,
                    end_at=horizon_end,
                    import_price_per_kwh=import_price,
                    export_price_per_kwh=export_price,
                    battery_penalty_per_kwh=self._configured_battery_penalty(config),
                ),
            )
        )

    @staticmethod
    def _normalize_configured_price(value: object, unit: object) -> Decimal | None:
        """Normalize a persisted price only when both value and unit are valid."""

        if isinstance(value, bool) or not isinstance(value, Decimal | int | float | str):
            return None
        try:
            return normalize_price(value, PriceUnit(str(unit)))
        except (ArithmeticError, TypeError, ValueError):
            return None

    def _configured_import_price(self, config: Mapping[str, Any]) -> Decimal | None:
        """Read a fresh current entity price or a fixed fallback without guessing."""

        price = config.get("fixed_import_price")
        unit = config.get("fixed_import_price_unit", "currency_per_kwh")
        if price is None:
            entity_id = config.get("current_price_entity_id")
            entity_price, updated_at = self._number_state(entity_id)
            if entity_price is None or updated_at is None:
                return None
            stale_seconds = self._nonnegative_number(config.get("price_stale_seconds"), 3600)
            if (datetime.now(UTC) - updated_at).total_seconds() > stale_seconds:
                return None
            price = entity_price
            unit = config.get("current_price_unit", unit)
        return self._normalize_configured_price(price, unit)

    def _configured_export_price(self, config: Mapping[str, Any]) -> Decimal:
        """Use a fixed/feed-in entity price; no value is safely zero opportunity cost."""

        price = config.get("feed_in_tariff")
        unit = config.get("feed_in_tariff_unit", "currency_per_kwh")
        if price is None:
            entity_price, updated_at = self._number_state(config.get("feed_in_entity_id"))
            stale_seconds = self._nonnegative_number(config.get("price_stale_seconds"), 3600)
            if (
                entity_price is not None
                and updated_at is not None
                and (datetime.now(UTC) - updated_at).total_seconds() <= stale_seconds
            ):
                price = entity_price
                unit = config.get("feed_in_entity_unit", unit)
        normalized = self._normalize_configured_price(price if price is not None else 0, unit)
        return normalized if normalized is not None else Decimal("0")

    def _configured_battery_penalty(self, config: Mapping[str, Any]) -> Decimal:
        normalized = self._normalize_configured_price(
            config.get("battery_penalty_per_kwh", 0), "currency_per_kwh"
        )
        return normalized if normalized is not None else Decimal("0")

    def _tou_price_intervals(
        self,
        now: datetime,
        horizon_end: datetime,
        config: Mapping[str, Any],
        default_export: Decimal,
    ) -> list[PriceInterval]:
        """Turn local-zone TOU definitions into non-overlapping five-minute intervals."""

        periods = config.get("tou_periods")
        if not isinstance(periods, list):
            return []
        resolution = timedelta(seconds=int(config.get("planning_resolution_seconds", 300)))
        zone = ZoneInfo(self.hass.config.time_zone)
        slots: list[tuple[datetime, datetime, Decimal, Decimal]] = []
        cursor = now
        while cursor < horizon_end:
            end = min(horizon_end, cursor + resolution)
            local = cursor.astimezone(zone)
            matched: Mapping[str, Any] | None = None
            for raw_period in periods:
                if not isinstance(raw_period, Mapping):
                    continue
                try:
                    start = local_time.fromisoformat(str(raw_period["start"]))
                    finish = local_time.fromisoformat(str(raw_period["end"]))
                    days = raw_period.get("days", list(range(7)))
                    if not isinstance(days, list) or local.weekday() not in days:
                        continue
                except (KeyError, TypeError, ValueError):
                    continue
                local_clock = local.timetz().replace(tzinfo=None)
                active = (
                    start <= local_clock < finish
                    if finish > start
                    else local_clock >= start or local_clock < finish
                )
                if active:
                    matched = raw_period
                    break
            if matched is not None:
                unit = matched.get(
                    "unit", config.get("fixed_import_price_unit", "currency_per_kwh")
                )
                import_price = self._normalize_configured_price(matched.get("import_price"), unit)
                configured_export = matched.get("export_price")
                export_price = (
                    default_export
                    if configured_export is None
                    else self._normalize_configured_price(configured_export, unit)
                )
                if import_price is not None and export_price is not None:
                    slots.append((cursor, end, import_price, export_price))
            cursor = end
        return self._coalesce_price_slots(slots, config)

    def _future_price_intervals(
        self,
        now: datetime,
        horizon_end: datetime,
        config: Mapping[str, Any],
        default_export: Decimal,
    ) -> list[PriceInterval]:
        """Parse compatible future-price entity attributes without provider coupling."""

        entity_id = config.get("future_price_entity_id")
        if not isinstance(entity_id, str):
            return []
        state = self.hass.states.get(entity_id)
        if state is None or state.state.lower() in {"unknown", "unavailable", "none"}:
            return []
        stale_seconds = self._nonnegative_number(config.get("price_stale_seconds"), 3600)
        if (datetime.now(UTC) - state.last_updated.astimezone(UTC)).total_seconds() > stale_seconds:
            return []
        attribute = config.get("future_price_attribute") or "prices"
        raw_points = state.attributes.get(attribute)
        if not isinstance(raw_points, list):
            return []
        raw_intervals: list[tuple[datetime, datetime | None, Decimal, Decimal]] = []
        default_unit = config.get("current_price_unit", "currency_per_kwh")
        for point in raw_points:
            if not isinstance(point, Mapping):
                continue
            start_text = point.get("start") or point.get("start_at") or point.get("from")
            end_text = point.get("end") or point.get("end_at") or point.get("to")
            price = point.get("price", point.get("value", point.get("import_price")))
            try:
                start = datetime.fromisoformat(str(start_text))
                end = datetime.fromisoformat(str(end_text)) if end_text else None
            except (TypeError, ValueError):
                continue
            if start.tzinfo is None or (end is not None and end.tzinfo is None):
                continue
            import_price = self._normalize_configured_price(price, point.get("unit", default_unit))
            configured_export = point.get("export_price")
            export_price = (
                default_export
                if configured_export is None
                else self._normalize_configured_price(
                    configured_export, point.get("unit", default_unit)
                )
            )
            if import_price is None or export_price is None:
                continue
            raw_intervals.append(
                (
                    start.astimezone(UTC),
                    end.astimezone(UTC) if end else None,
                    import_price,
                    export_price,
                )
            )
        raw_intervals.sort(key=lambda item: item[0])
        intervals: list[PriceInterval] = []
        for index, (start, end, import_price, export_price) in enumerate(raw_intervals):
            finish = end or (
                raw_intervals[index + 1][0] if index + 1 < len(raw_intervals) else None
            )
            if finish is None or finish <= start:
                continue
            clipped_start = max(start, now)
            clipped_end = min(finish, horizon_end)
            if clipped_end <= clipped_start:
                continue
            intervals.append(
                PriceInterval(
                    clipped_start,
                    clipped_end,
                    import_price,
                    export_price,
                    self._configured_battery_penalty(config),
                )
            )
        return intervals

    @staticmethod
    def _coalesce_price_slots(
        slots: Sequence[tuple[datetime, datetime, Decimal, Decimal]],
        config: Mapping[str, Any],
    ) -> list[PriceInterval]:
        """Coalesce adjacent equal TOU slot prices into compact pure intervals."""

        if not slots:
            return []
        penalty = SiteCoordinator._normalize_configured_price(
            config.get("battery_penalty_per_kwh", 0), "currency_per_kwh"
        ) or Decimal("0")
        groups: list[PriceInterval] = []
        start, end, import_price, export_price = slots[0]
        for slot_start, slot_end, slot_import, slot_export in slots[1:]:
            if slot_start == end and slot_import == import_price and slot_export == export_price:
                end = slot_end
                continue
            groups.append(PriceInterval(start, end, import_price, export_price, penalty))
            start, end, import_price, export_price = slot_start, slot_end, slot_import, slot_export
        groups.append(PriceInterval(start, end, import_price, export_price, penalty))
        return groups

    def _load_request(
        self,
        config: Mapping[str, Any],
        feedback: AdapterFeedback | None,
        now: datetime,
        *,
        source: CommandSource = CommandSource.AUTOMATIC,
        site_config: Mapping[str, Any] | None = None,
        recovery: Mapping[str, Any] | None = None,
    ) -> LoadRequest | None:
        """Translate a configured requirement into one immutable policy request."""

        load_id = config.get("load_id")
        expected_w = self._as_positive(config.get("expected_power_w"))
        if not isinstance(load_id, str) or expected_w is None or not config.get("enabled", True):
            return None
        requirements = self._mapping_or_empty(config.get("requirements"))
        recovery = self._recovery if recovery is None else recovery
        runtime_data = self._mapping_or_empty(recovery.get("load_runtime"))
        runtime = self._mapping_or_empty(runtime_data.get(load_id))
        learning_data = self._mapping_or_empty(recovery.get("learning"))
        learning = self._mapping_or_empty(learning_data.get(load_id))
        learned_power = self._as_positive(learning.get("expected_power_w"))
        # Learning can make planning more conservative but may never lower the
        # user-configured equipment estimate or alter any hard site limit.
        if learned_power is not None and learning.get("source") == "learned":
            expected_w = max(expected_w, learned_power)
        completed_runtime_s = (
            self._nonnegative_number(runtime.get("confirmed_runtime_today_h")) * 3600
        )
        completed_energy_wh = self._nonnegative_number(runtime.get("energy_today_kwh")) * 1000
        runtime_target_s = self._first_positive(
            requirements.get("minimum_confirmed_runtime_s"),
            requirements.get("minimum_runtime_s"),
            requirements.get("target_runtime_s"),
        )
        energy_target_kwh = self._as_positive(requirements.get("minimum_energy_kwh"))
        energy_target_wh = self._first_positive(
            requirements.get("minimum_energy_wh"),
            requirements.get("target_energy_wh"),
            energy_target_kwh * 1000 if energy_target_kwh is not None else None,
        )
        remaining_runtime_s = (
            max(0.0, runtime_target_s - completed_runtime_s)
            if runtime_target_s is not None
            else None
        )
        remaining_energy_wh = (
            max(0.0, energy_target_wh - completed_energy_wh)
            if energy_target_wh is not None
            else None
        )

        target_temperature = self._as_nonnegative(requirements.get("target_temperature_c"))
        if target_temperature is not None and (
            feedback is None
            or feedback.temperature_c is None
            or feedback.temperature_c < target_temperature
        ):
            remaining_runtime_s = max(
                remaining_runtime_s or 0.0,
                self._nonnegative_number(requirements.get("fallback_runtime_s", 300)),
            )
        target_soc = self._as_positive(requirements.get("target_soc_pct"))
        if target_soc is not None and (
            feedback is None
            or feedback.state_of_charge_pct is None
            or feedback.state_of_charge_pct < target_soc
        ):
            remaining_runtime_s = max(
                remaining_runtime_s or 0.0,
                self._nonnegative_number(requirements.get("fallback_runtime_s", 300)),
            )

        mode = str(config.get("optimisation_mode", "cost_optimised_hybrid"))
        if source is CommandSource.MANUAL:
            remaining_runtime_s = 300
        elif (
            remaining_runtime_s is None
            and remaining_energy_wh is None
            and mode
            in {
                "schedule_only",
                "solar_surplus_only",
                "free_energy_only",
            }
        ):
            remaining_runtime_s = 300
        elif remaining_runtime_s is None and remaining_energy_wh is None:
            return None

        windows = self._schedule_windows(config.get("schedule_windows"))
        if mode == "free_energy_only":
            current_site = self.site_config if site_config is None else site_config
            windows = self._schedule_windows(
                current_site.get("free_energy_periods"), default_kind="free_energy"
            )
        safety = self._mapping_or_empty(config.get("safety"))
        variable = self._mapping_or_empty(config.get("actuator"))
        minimum_w = self._as_positive(
            variable.get("minimum_power_w") or variable.get("minimum_setpoint_w")
        )
        maximum_w = self._as_positive(
            variable.get("maximum_power_w") or variable.get("maximum_setpoint_w")
        )
        phase = config.get("phase_assignment")
        phase = str(phase) if phase in {"a", "b", "c"} else None
        return LoadRequest(
            load_id=load_id,
            requested_power_w=expected_w,
            remaining_runtime_s=remaining_runtime_s,
            remaining_energy_wh=remaining_energy_wh,
            deadline_at=self._parse_deadline(
                requirements.get("deadline_at") or requirements.get("deadline")
            ),
            allowed_windows=windows,
            mandatory=any(window.mandatory for window in windows),
            priority=int(config.get("priority", 50)),
            minimum_power_w=minimum_w,
            maximum_power_w=maximum_w,
            min_contiguous_s=self._nonnegative_number(
                safety.get("minimum_on_seconds", safety.get("min_on_seconds", 0))
            ),
            current_power_w=max(0.0, feedback.active_power_w or 0.0) if feedback else 0.0,
            phase=phase,
            control_source=source,
            fairness_debt=self._nonnegative_number(runtime.get("fairness_debt")),
        )

    @staticmethod
    def _first_positive(*values: object) -> float | None:
        for value in values:
            if isinstance(value, int | float) and value > 0:
                return float(value)
        return None

    @staticmethod
    def _as_nonnegative(value: object) -> float | None:
        """Return a finite non-negative number without trusting persisted state."""

        if isinstance(value, bool) or not isinstance(value, int | float):
            return None
        number = float(value)
        return number if number >= 0 and isfinite(number) else None

    @classmethod
    def _nonnegative_number(cls, value: object, default: float = 0.0) -> float:
        """Use a bounded numeric fallback for old/corrupt recovery records."""

        parsed = cls._as_nonnegative(value)
        return default if parsed is None else parsed

    @staticmethod
    def _positive_int(value: object) -> int | None:
        """Return a positive integer for bounded hardware-rate settings."""

        if isinstance(value, bool) or not isinstance(value, int) or value < 1:
            return None
        return value

    @staticmethod
    def _parse_deadline(value: object) -> datetime | None:
        if not isinstance(value, str) or not value:
            return None
        try:
            parsed = datetime.fromisoformat(value)
        except ValueError:
            return None
        if parsed.tzinfo is None:
            return None
        return parsed.astimezone(UTC)

    def _solar_should_run(
        self,
        config: Mapping[str, Any],
        feedback: AdapterFeedback | None,
        snapshot: SitePowerSnapshot,
        now: datetime,
        *,
        persist: bool = True,
        recovery: Mapping[str, Any] | None = None,
    ) -> bool:
        """Apply persisted hysteresis/qualification to solar-only load requests."""

        load_id = str(config["load_id"])
        policy_config = self._mapping_or_empty(config.get("solar"))
        expected_w = float(config.get("expected_power_w", 0))
        start_threshold = float(policy_config.get("start_threshold_w", expected_w))
        stop_threshold = float(policy_config.get("stop_threshold_w", start_threshold * 0.25))
        try:
            policy = SolarPolicy(
                start_threshold_w=max(0.0, start_threshold),
                stop_threshold_w=max(0.0, stop_threshold),
                start_qualification_s=float(policy_config.get("start_qualification_seconds", 0)),
                stop_qualification_s=float(policy_config.get("stop_qualification_seconds", 0)),
                min_on_s=float(policy_config.get("minimum_on_seconds", 0)),
                min_off_s=float(policy_config.get("minimum_off_seconds", 0)),
                max_starts_per_hour=self._positive_int(policy_config.get("max_starts_per_hour")),
                max_starts_per_day=self._positive_int(policy_config.get("max_starts_per_day")),
            )
        except (TypeError, ValueError):
            return False
        recovery = self._recovery if recovery is None else recovery
        raw_states = self._mapping_or_empty(recovery.get("solar_states"))
        raw_state = self._mapping_or_empty(raw_states.get(load_id))
        state = SolarQualificationState(
            start_candidate_at=self._parse_deadline(raw_state.get("start_candidate_at")),
            stop_candidate_at=self._parse_deadline(raw_state.get("stop_candidate_at")),
            last_started_at=self._parse_deadline(raw_state.get("last_started_at")),
            last_stopped_at=self._parse_deadline(raw_state.get("last_stopped_at")),
            recent_starts_at=tuple(
                stamp
                for item in raw_state.get("recent_starts_at", [])
                if (stamp := self._parse_deadline(item)) is not None
            ),
        )
        surplus = max(0.0, -snapshot.grid_import_w)
        decision = evaluate_solar(
            at=now,
            available_solar_w=surplus,
            is_running=bool(feedback and feedback.confirmed_state),
            policy=policy,
            state=state,
        )
        if persist:
            self._recovery.setdefault("solar_states", {})[load_id] = {
                "start_candidate_at": decision.state.start_candidate_at.isoformat()
                if decision.state.start_candidate_at
                else None,
                "stop_candidate_at": decision.state.stop_candidate_at.isoformat()
                if decision.state.stop_candidate_at
                else None,
                "last_started_at": decision.state.last_started_at.isoformat()
                if decision.state.last_started_at
                else None,
                "last_stopped_at": decision.state.last_stopped_at.isoformat()
                if decision.state.last_stopped_at
                else None,
                "recent_starts_at": [
                    stamp.isoformat() for stamp in decision.state.recent_starts_at
                ],
            }
        return decision.action is SolarAction.START or (
            bool(feedback and feedback.confirmed_state)
            and decision.action is SolarAction.NONE
            and ReasonCode.SOLAR_INSUFFICIENT not in decision.reasons
        )

    def _should_run_now(
        self,
        config: Mapping[str, Any],
        feedback: AdapterFeedback | None,
        snapshot: SitePowerSnapshot,
        now: datetime,
        planned_load_ids: set[str],
        *,
        persist_solar_state: bool = True,
        site_config: Mapping[str, Any] | None = None,
        recovery: Mapping[str, Any] | None = None,
    ) -> bool:
        """Decide whether the current instant has a policy request, not authority."""

        if not config.get("enabled", True) or not config.get("automatic_control"):
            return False
        mode = str(config.get("optimisation_mode", "cost_optimised_hybrid"))
        if mode in {"disabled", "manual"}:
            return False
        if mode == "schedule_only":
            return is_active_at(
                now,
                self.hass.config.time_zone,
                self._schedule_windows(config.get("schedule_windows")),
            )
        if mode == "free_energy_only":
            current_site = self.site_config if site_config is None else site_config
            return is_active_at(
                now,
                self.hass.config.time_zone,
                self._schedule_windows(
                    current_site.get("free_energy_periods"), default_kind="free_energy"
                ),
            )
        if mode == "solar_surplus_only":
            return self._solar_should_run(
                config, feedback, snapshot, now, persist=persist_solar_state, recovery=recovery
            )
        if mode == "solar_preferred_guarantee" and self._solar_should_run(
            config, feedback, snapshot, now, persist=persist_solar_state, recovery=recovery
        ):
            return True
        return str(config.get("load_id")) in planned_load_ids

    @staticmethod
    def _battery_blocks_discretionary(
        site_config: Mapping[str, Any],
        snapshot: SitePowerSnapshot,
        request: LoadRequest | None,
    ) -> bool:
        """Keep ordinary loads from intentionally deepening battery discharge.

        A user selects the battery power sign convention at the HA boundary.
        Mandatory/deadline work remains eligible for safe arbitration; this
        policy only withholds discretionary ordinary requests.
        """

        battery = site_config.get("battery")
        if not isinstance(battery, Mapping) or not battery.get("prevent_discretionary_discharge"):
            return False
        if snapshot.battery_power_w is None:
            return False
        discharge_w = snapshot.battery_power_w
        if battery.get("power_sign_convention", "discharge_positive") == "charge_positive":
            discharge_w = -discharge_w
        threshold = SiteCoordinator._nonnegative_number(
            battery.get("discretionary_discharge_limit_w"), 0
        )
        if discharge_w <= threshold:
            return False
        return request is None or (not request.mandatory and request.deadline_at is None)

    def _update_runtime_from_feedback(self, load_id: str, feedback: AdapterFeedback) -> None:
        """Maintain bounded confirmed/derived accounting from fresh feedback.

        The integration-owned Energy sensor is always monotonic.  A configured
        device energy entity is used only as a positive, plausible delta; a
        counter reset, missing reading, or outlier falls back to the prior
        confirmed power estimate and records its provenance for diagnostics.
        """

        runtime = self._recovery.setdefault("load_runtime", {}).setdefault(load_id, {})
        now = feedback.observed_at
        previous_at = self._parse_deadline(runtime.get("last_feedback_at"))
        previous_running = bool(runtime.get("confirmed_active"))
        previous_power = self._nonnegative_number(runtime.get("current_power_w"))
        day_key, day_start = self._operational_day_at(now)
        crossed_operational_day = runtime.get("operational_day") not in {None, day_key}
        if crossed_operational_day:
            self._archive_operational_day(load_id, runtime)
            for field in (
                "runtime_today_h",
                "confirmed_runtime_today_h",
                "energy_today_kwh",
                "cost_today",
                "starts_today",
            ):
                runtime[field] = 0
        runtime["operational_day"] = day_key

        if previous_at is not None and now > previous_at and previous_running:
            # Do not retrospectively add an entire missed day after a restart;
            # record only the safe portion in the current operational day.
            interval_start = max(previous_at, day_start)
            duration_h = max(0.0, (now - interval_start).total_seconds() / 3600)
            if duration_h > 0:
                runtime["runtime_today_h"] = (
                    self._nonnegative_number(runtime.get("runtime_today_h")) + duration_h
                )
                runtime["confirmed_runtime_today_h"] = (
                    self._nonnegative_number(runtime.get("confirmed_runtime_today_h")) + duration_h
                )
                derived_kwh = previous_power * duration_h / 1000
                # A device counter delta spanning an operational-day boundary
                # cannot be apportioned faithfully without a time series. Use
                # confirmed-power accounting for the current-day portion.
                measured_delta = (
                    None
                    if crossed_operational_day
                    else self._measured_energy_delta(runtime, feedback.energy_kwh, derived_kwh)
                )
                delivered_kwh = measured_delta if measured_delta is not None else derived_kwh
                provenance = "measured" if measured_delta is not None else "derived"
                runtime["energy_today_kwh"] = (
                    self._nonnegative_number(runtime.get("energy_today_kwh")) + delivered_kwh
                )
                runtime["energy_total_kwh"] = (
                    self._nonnegative_number(runtime.get("energy_total_kwh")) + delivered_kwh
                )
                runtime["energy_provenance"] = provenance
                tariff = self._tariff_timeline(now).at(now)
                if tariff is not None:
                    cost = Decimal(str(delivered_kwh)) * tariff.import_price_per_kwh
                    runtime["cost_today"] = str(
                        self._decimal_or_zero(runtime.get("cost_today")) + cost
                    )
                    runtime["cost_provenance"] = "derived_marginal"
                self._update_learning_from_interval(
                    load_id,
                    feedback,
                    power_w=previous_power,
                    duration_s=duration_h * 3600,
                )
        if previous_at is not None and not previous_running and feedback.confirmed_state:
            runtime["starts_today"] = int(self._nonnegative_number(runtime.get("starts_today"))) + 1
            runtime["starts_total"] = int(self._nonnegative_number(runtime.get("starts_total"))) + 1
        runtime["last_feedback_at"] = now.isoformat()
        runtime["confirmed_active"] = feedback.confirmed_state
        runtime["current_power_w"] = self._nonnegative_number(feedback.active_power_w)
        if (
            feedback.energy_kwh is not None
            and self._as_nonnegative(feedback.energy_kwh) is not None
        ):
            runtime["last_measured_energy_kwh"] = feedback.energy_kwh
            runtime["measured_energy_kwh"] = feedback.energy_kwh
        runtime["temperature_c"] = feedback.temperature_c
        runtime["state_of_charge_pct"] = feedback.state_of_charge_pct
        runtime["feedback_available"] = feedback.available

    def _operational_day_at(self, instant: datetime) -> tuple[str, datetime]:
        """Resolve the configured local operational-day boundary to UTC."""

        config = self.site_config
        zone = ZoneInfo(self.hass.config.time_zone)
        boundary = local_time.fromisoformat(str(config.get("operational_day_boundary", "00:00")))
        local = instant.astimezone(zone)
        start_date = (
            local.date()
            if local.timetz().replace(tzinfo=None) >= boundary
            else local.date() - timedelta(days=1)
        )
        start_at = resolve_local_datetime(
            start_date, boundary, zone, boundary=ScheduleBoundary.START
        )
        return start_date.isoformat(), start_at

    def _archive_operational_day(self, load_id: str, runtime: Mapping[str, Any]) -> None:
        """Retain a compact completed-day summary instead of a time-series store."""

        day = runtime.get("operational_day")
        if not isinstance(day, str):
            return
        summaries = self._recovery.setdefault("daily_summaries", {})
        if not isinstance(summaries, dict):
            self._recovery["daily_summaries"] = summaries = {}
        by_load = summaries.setdefault(day, {})
        if not isinstance(by_load, dict):
            summaries[day] = by_load = {}
        by_load[load_id] = {
            "confirmed_runtime_h": self._nonnegative_number(
                runtime.get("confirmed_runtime_today_h")
            ),
            "energy_kwh": self._nonnegative_number(runtime.get("energy_today_kwh")),
            "cost": str(runtime.get("cost_today", "0")),
            "provenance": runtime.get("energy_provenance", "unknown"),
        }
        # Bound the compact recovery summary.  Long-term history belongs to
        # Recorder/statistics, not this recovery Store.
        limit = int(self.site_config.get("history_retention_days", 90))
        for stale_day in sorted(summaries)[: -max(1, min(limit, 366))]:
            summaries.pop(stale_day, None)

    def _measured_energy_delta(
        self,
        runtime: Mapping[str, Any],
        current_kwh: float | None,
        derived_kwh: float,
    ) -> float | None:
        """Accept only monotonic, plausible device-counter deltas."""

        current = self._as_nonnegative(current_kwh)
        previous = self._as_nonnegative(runtime.get("last_measured_energy_kwh"))
        if current is None or previous is None or current < previous:
            return None
        delta = current - previous
        # Generous allowance absorbs reporting cadence but filters accidental
        # unit changes and corrupted counter jumps.
        if delta > max(5.0, derived_kwh * 5 + 0.1):
            return None
        return delta

    @staticmethod
    def _decimal_or_zero(value: object) -> Decimal:
        try:
            parsed = Decimal(str(value))
            return parsed if parsed.is_finite() else Decimal("0")
        except (ArithmeticError, ValueError):
            return Decimal("0")

    def _update_learning_from_interval(
        self,
        load_id: str,
        feedback: AdapterFeedback,
        *,
        power_w: float,
        duration_s: float,
    ) -> None:
        """Persist a conservative bounded learning update from valid feedback."""

        if duration_s < 60 or power_w <= 0 or not feedback.available:
            return
        try:
            _, config = self._find_load(load_id)
        except LoadNotFoundError:
            return
        learning_config = self._mapping_or_empty(config.get("learning"))
        if not learning_config.get("enabled", True):
            return
        # Manual boosts/tests and uncertain state feedback are intentionally
        # excluded so they cannot distort an automatic operating estimate.
        if load_id in self._active_overrides() or load_id in self._mapping_or_empty(
            self._recovery.get("actuator_tests")
        ):
            return
        configured_power = self._as_positive(config.get("expected_power_w"))
        if configured_power is None:
            return
        requirements = self._mapping_or_empty(config.get("requirements"))
        configured_duration = (
            self._first_positive(
                requirements.get("target_runtime_s"),
                requirements.get("minimum_runtime_s"),
                requirements.get("minimum_confirmed_runtime_s"),
            )
            or 3600
        )
        try:
            window_size = int(learning_config.get("window_size", 31))
            min_samples = int(
                learning_config.get("minimum_samples", learning_config.get("min_samples", 5))
            )
            window_size = max(1, min(365, window_size))
            min_samples = max(1, min(window_size, min_samples))
            policy = LearningPolicy(
                configured_power_w=configured_power,
                configured_duration_s=configured_duration,
                minimum_power_w=self._nonnegative_number(
                    learning_config.get("minimum_power_w"), configured_power * 0.5
                ),
                maximum_power_w=self._nonnegative_number(
                    learning_config.get("maximum_power_w"), configured_power * 2
                ),
                minimum_duration_s=self._nonnegative_number(
                    learning_config.get("minimum_duration_s"), 1
                ),
                maximum_duration_s=self._nonnegative_number(
                    learning_config.get("maximum_duration_s"), 7 * 24 * 3600
                ),
                window_size=window_size,
                min_samples=min_samples,
                ewma_alpha=float(learning_config.get("ewma_alpha", 0.35)),
                outlier_ratio=float(learning_config.get("outlier_ratio", 3)),
            )
            raw_learning = self._mapping_or_empty(self._recovery_mapping("learning").get(load_id))
            samples = tuple(
                LearningSample(
                    observed_at=stamp,
                    power_w=self._nonnegative_number(item.get("power_w")),
                    duration_s=self._nonnegative_number(item.get("duration_s")),
                    feedback_valid=bool(item.get("feedback_valid", True)),
                )
                for item in raw_learning.get("samples", [])
                if isinstance(item, Mapping)
                and (stamp := self._parse_deadline(item.get("observed_at"))) is not None
            )
            state = LearningState(
                samples=samples,
                ewma_power_w=self._as_nonnegative(raw_learning.get("ewma_power_w")),
                ewma_duration_s=self._as_nonnegative(raw_learning.get("ewma_duration_s")),
                frozen=bool(
                    raw_learning.get("frozen", False) or learning_config.get("frozen", False)
                ),
            )
            update = update_learning(
                load_id=load_id,
                policy=policy,
                state=state,
                sample=LearningSample(
                    observed_at=feedback.observed_at,
                    power_w=max(power_w, self._nonnegative_number(feedback.active_power_w)),
                    duration_s=duration_s,
                    feedback_valid=feedback.confirmed_state is True,
                ),
            )
        except (TypeError, ValueError):
            return
        self._recovery_mapping("learning")[load_id] = {
            "samples": [
                {
                    "observed_at": sample.observed_at.isoformat(),
                    "power_w": sample.power_w,
                    "duration_s": sample.duration_s,
                    "feedback_valid": sample.feedback_valid,
                }
                for sample in update.state.samples
            ],
            "ewma_power_w": update.state.ewma_power_w,
            "ewma_duration_s": update.state.ewma_duration_s,
            "frozen": update.state.frozen,
            "expected_power_w": update.estimate.expected_power_w,
            "expected_duration_s": update.estimate.expected_duration_s,
            "confidence": update.estimate.confidence,
            "sample_count": update.estimate.sample_count,
            "source": update.estimate.source,
            "last_update_at": feedback.observed_at.isoformat(),
            "last_reason_code": update.reasons[0].value,
        }

    @staticmethod
    def _serialize_plan_result(plan: Any) -> dict[str, Any]:
        """Convert pure immutable plan output into bounded JSON-safe panel data."""

        return {
            "generated_at": plan.generated_at.isoformat(),
            "horizon_end_at": plan.horizon_end_at.isoformat(),
            "slot_seconds": plan.slot_seconds,
            "intervals": [
                {
                    "load_id": interval.load_id,
                    "start_at": interval.start_at.isoformat(),
                    "end_at": interval.end_at.isoformat(),
                    "power_w": interval.power_w,
                    "solar_allocated_w": interval.solar_allocated_w,
                    "expected_cost": str(interval.expected_cost),
                    "reason_code": interval.reason.value,
                }
                for interval in plan.intervals
            ],
            "loads": [
                {
                    "load_id": result.load_id,
                    "required_slots": result.required_slots,
                    "scheduled_slots": result.scheduled_slots,
                    "unmet_slots": result.unmet_slots,
                    "expected_cost": str(result.expected_cost),
                    "reason_codes": [reason.value for reason in result.reasons],
                }
                for result in plan.loads
            ],
            "warnings": [warning.value for warning in plan.warnings],
            "next_action": min(
                (interval.start_at.isoformat() for interval in plan.intervals), default=None
            ),
            "preview_only": False,
        }

    async def _async_apply_authorized(
        self,
        *,
        load_id: str,
        config: Mapping[str, Any],
        desired_enabled: bool,
        source: CommandSource,
        granted_power_w: float | None,
        hard_safety_ok: bool,
    ) -> tuple[bool, str]:
        """Apply an already-arbitrated command exactly once when feedback differs."""

        feedback = self._feedback.get(load_id)
        action = CommandAction.START if desired_enabled else CommandAction.STOP
        if granted_power_w is not None and desired_enabled and self._is_variable_load(config):
            action = CommandAction.SET_POWER
        authorization = authorize_command(
            CommandProposal(
                load_id=load_id, action=action, source=source, requested_power_w=granted_power_w
            ),
            automatic_enabled=bool(config.get("automatic_control")),
            observation_ready=self._observation_ready,
            hard_safety_ok=hard_safety_ok,
        )
        if not authorization.allowed:
            return False, authorization.reasons[0].value
        requested_setpoint = (
            self._setpoint_for_power(config, granted_power_w) if desired_enabled else None
        )
        unchanged_state = feedback is not None and feedback.confirmed_state is desired_enabled
        unchanged_setpoint = (
            requested_setpoint is None
            or feedback is None
            or feedback.setpoint is None
            or abs(feedback.setpoint - requested_setpoint) < 0.01
        )
        if unchanged_state and unchanged_setpoint:
            return False, "feedback_already_matches"
        adapter = self._adapters.get(load_id)
        if adapter is None:
            return False, "actuator_unavailable"
        runtime = self._recovery.setdefault("load_runtime", {}).setdefault(load_id, {})
        retry_after = self._nonnegative_number(
            (config.get("safety") or {}).get("actuator_retry_seconds")
            if isinstance(config.get("safety"), Mapping)
            else None,
            60,
        )
        last_attempt = self._parse_deadline(runtime.get("last_control_attempt"))
        if (
            last_attempt is not None
            and (datetime.now(UTC) - last_attempt).total_seconds() < retry_after
        ):
            return False, "actuator_retry_backoff"
        runtime["last_control_attempt"] = datetime.now(UTC).isoformat()
        try:
            fresh = await adapter.async_apply(
                AdapterCommand(
                    desired_enabled=desired_enabled,
                    setpoint=requested_setpoint,
                    source=source.value,
                    reason_code=authorization.reasons[0].value,
                )
            )
        except Exception:  # Never loop retries after an actuator error.
            runtime["fault_state"] = "actuator_unavailable"
            self._record_decision(
                "fault",
                "actuator_unavailable",
                _REDACTED_ACTUATOR_FAILURE_MESSAGE,
                load_id=load_id,
            )
            async_create_runtime_issue(
                self.hass, self.entry.entry_id, f"actuator_unavailable_{load_id}"
            )
            return False, "actuator_unavailable"
        if not fresh.available or fresh.confirmed_state is not desired_enabled:
            # A successful service response is not proof an appliance changed
            # state.  Preserve feedback-confirmation as the authority and slow
            # retries to avoid command loops on a faulty/misconfigured device.
            self._feedback[load_id] = fresh
            self._update_runtime_from_feedback(load_id, fresh)
            runtime["fault_state"] = "actuator_feedback_mismatch"
            self._record_decision(
                "fault",
                "actuator_feedback_mismatch",
                "Actuator command was not confirmed by fresh feedback.",
                load_id=load_id,
            )
            async_create_runtime_issue(
                self.hass,
                self.entry.entry_id,
                f"actuator_feedback_mismatch_{load_id}",
            )
            return False, "actuator_feedback_mismatch"
        self._feedback[load_id] = fresh
        self._update_runtime_from_feedback(load_id, fresh)
        runtime.pop("fault_state", None)
        async_delete_issue(self.hass, f"actuator_unavailable_{load_id}_{self.entry.entry_id}")
        async_delete_issue(
            self.hass,
            f"actuator_feedback_mismatch_{load_id}_{self.entry.entry_id}",
        )
        runtime["commanded_state"] = desired_enabled
        runtime["last_successful_control"] = datetime.now(UTC).isoformat()
        if requested_setpoint is not None:
            runtime["requested_setpoint"] = requested_setpoint
        self._record_decision(
            "manual_on" if source is CommandSource.MANUAL and desired_enabled else "idle",
            authorization.reasons[0].value,
            "Authorized actuator command confirmed by adapter observation.",
            load_id=load_id,
        )
        return True, authorization.reasons[0].value

    @staticmethod
    def _is_variable_load(config: Mapping[str, Any]) -> bool:
        actuator = config.get("actuator")
        return isinstance(actuator, Mapping) and actuator.get("adapter_type") == "variable_number"

    @staticmethod
    def _setpoint_for_power(config: Mapping[str, Any], power_w: float | None) -> float | None:
        if power_w is None:
            return None
        actuator = config.get("actuator")
        if not isinstance(actuator, Mapping):
            return None
        voltage = float(actuator.get("nominal_voltage", 230))
        phases = int(config.get("phase_count", 1))
        if voltage <= 0 or phases <= 0:
            return None
        return power_w / (voltage * phases)

    def _find_load(self, load_id: str) -> tuple[ConfigSubentry, dict[str, Any]]:
        for subentry, config in self._load_configs():
            if config.get("load_id") == load_id:
                return subentry, config
        raise LoadNotFoundError(load_id)

    async def async_site_summary(self) -> dict[str, Any]:
        """Return a bounded panel/entity summary without exposing arbitrary states."""

        config = self.site_config
        loads = self._load_configs()
        overrides = self._active_overrides()
        active_feedback = [
            feedback for feedback in self._feedback.values() if feedback.confirmed_state
        ]
        snapshot = self._site_snapshot(config)
        warnings = self._current_warnings(overrides=overrides, site_config=config)
        attention = self._attention_items(
            overrides=overrides,
            site_config=config,
            configs=[item for _, item in loads],
            warnings=warnings,
        )
        return {
            "entry_id": self.entry.entry_id,
            "site_id": self.entry.data.get("site_id"),
            "name": config["site_name"],
            "config_revision": config["config_revision"],
            "state": "initialising" if not self._started else "idle",
            "active_loads": len(active_feedback),
            "waiting_loads": max(
                0,
                len(
                    [
                        config
                        for _, config in loads
                        if config.get("load_id") and not config.get("invalid")
                    ]
                )
                - len(active_feedback),
            ),
            "total_controlled_power_w": round(
                sum(max(0.0, feedback.active_power_w or 0.0) for feedback in active_feedback), 3
            ),
            "next_action": self._last_plan.get("next_action") if self._last_plan else None,
            "constraint_status": "ok"
            if snapshot.available and self._core_site_config(config) is not None
            else "attention",
            "last_replan_at": self._last_replan_at.isoformat() if self._last_replan_at else None,
            "warnings": warnings,
            "attention_count": len(attention),
            "attention": attention,
        }

    async def async_load_list(self) -> list[dict[str, Any]]:
        """Return panel-safe summaries for all configured loads."""

        overrides = self._active_overrides()
        result: list[dict[str, Any]] = []
        for _, config in self._load_configs():
            if config.get("invalid"):
                result.append(
                    {
                        "load_id": config.get("load_id"),
                        "name": config["display_name"],
                        "state": "fault",
                        "reason_code": "load_configuration_invalid",
                        "automatic_control": False,
                        "fault": True,
                        "validation": config["invalid"],
                    }
                )
                continue
            load_id = config["load_id"]
            override = overrides.get(load_id)
            result.append(
                {
                    "load_id": load_id,
                    "name": config["display_name"],
                    "type": config["load_type"],
                    "automatic_control": config["automatic_control"],
                    "optimisation_mode": config["optimisation_mode"],
                    "priority": config["priority"],
                    "state": self._load_state(config, override),
                    "reason_code": self._load_reason(config, override),
                    "override": override,
                    "fault": self._load_runtime_fault(load_id) is not None,
                    "config_revision": config["config_revision"],
                }
            )
        return result

    async def async_load_detail(self, load_id: str) -> dict[str, Any]:
        """Return one load's configuration and bounded runtime information."""

        _, config = self._find_load(load_id)
        if config.get("invalid"):
            return {"load_id": load_id, "state": "fault", "validation": config["invalid"]}
        runtime = self._mapping_or_empty(
            self._mapping_or_empty(self._recovery.get("load_runtime")).get(load_id)
        )
        learning_map = self._mapping_or_empty(self._recovery.get("learning"))
        tests = self._mapping_or_empty(self._recovery.get("actuator_tests"))
        return {
            "config": config,
            "state": self._load_state(config, self._active_overrides().get(load_id)),
            "reason_code": self._load_reason(config, self._active_overrides().get(load_id)),
            "runtime": runtime,
            "learning": self._mapping_or_empty(learning_map.get(load_id)),
            "override": self._active_overrides().get(load_id),
            "actuator_test": tests.get(load_id) if isinstance(tests, Mapping) else None,
            "plan": self._plan_for_load(load_id),
        }

    async def async_configuration_read(self) -> dict[str, Any]:
        """Return only integration-owned configuration and revisions."""

        return {
            "site": self.site_config,
            "loads": [config for _, config in self._load_configs()],
            "schema": configuration_schema(),
        }

    async def async_validate_configuration(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        """Validate a staged site/load/full payload without changing runtime state."""

        try:
            _, _, response_config = self._candidate_preview_configuration(payload)
        except ConfigurationValidationError as err:
            return {"valid": False, "issues": serialize_issues(err)}
        return {"valid": True, **response_config}

    async def async_update_site_config(
        self, raw: Mapping[str, Any], if_revision: int | None
    ) -> dict[str, Any]:
        """Validate and atomically replace mutable site settings."""

        async with self._lock:
            current = self.site_config
            self._require_revision(current, if_revision)
            candidate = dict(current)
            candidate.update(dict(raw))
            candidate["config_revision"] = current["config_revision"] + 1
            normalized = validate_site_config(candidate)
            self.hass.config_entries.async_update_entry(
                self.entry,
                title=normalized["site_name"],
                options=normalized,
            )
            self._record_decision(
                "idle", "configuration_updated", "Site configuration was updated."
            )
            await self._async_persist_locked()
        await self.async_replan(reason="configuration_updated")
        return normalized

    async def async_add_load(self, raw: Mapping[str, Any]) -> dict[str, Any]:
        """Create a load subentry through the same authoritative validator."""

        async with self._lock:
            normalized = validate_load_config(raw, create_id=True)
            self._validate_actuator_binding_ownership(normalized)
            title = normalized["display_name"]
            subentry = ConfigSubentry(
                data=MappingProxyType(normalized),
                subentry_type=LOAD_SUBENTRY_TYPE,
                title=title,
                unique_id=normalized["load_id"],
            )
            self.hass.config_entries.async_add_subentry(self.entry, subentry)
            self._record_decision("idle", "configuration_updated", f"Added load {title}.")
            await self._async_persist_locked()
        await self.async_replan(reason="load_added")
        return normalized

    async def async_update_load(
        self,
        load_id: str,
        raw: Mapping[str, Any],
        if_revision: int | None,
        *,
        _replan: bool = True,
    ) -> dict[str, Any]:
        """Update a load only if the caller holds its current revision."""

        async with self._lock:
            subentry, current = self._find_load(load_id)
            self._require_revision(current, if_revision)
            candidate = dict(current)
            candidate.update(dict(raw))
            candidate["load_id"] = load_id
            candidate["config_revision"] = current["config_revision"] + 1
            normalized = validate_load_config(candidate)
            self._validate_actuator_binding_ownership(normalized, exclude_load_id=load_id)
            self.hass.config_entries.async_update_subentry(
                self.entry,
                subentry,
                title=normalized["display_name"],
                data=normalized,
            )
            self._record_decision(
                "idle", "configuration_updated", f"Updated load {normalized['display_name']}."
            )
            await self._async_persist_locked()
        if _replan:
            await self.async_replan(reason="load_updated")
        else:
            self._notify_update()
        return normalized

    async def async_duplicate_load(
        self,
        load_id: str,
        if_revision: int | None,
        display_name: str | None = None,
    ) -> dict[str, Any]:
        """Duplicate a load only from the revision a caller actually reviewed.

        A duplicate is a configuration mutation even though it does not update
        the source subentry.  Checking the source revision prevents a panel
        from cloning stale actuator, safety, or schedule settings after a
        concurrent edit.
        """

        async with self._lock:
            _, current = self._find_load(load_id)
            self._require_revision(current, if_revision)
            candidate = dict(current)
            candidate["load_id"] = None
            candidate["config_revision"] = 0
            candidate["display_name"] = display_name or f"{current['display_name']} copy"
            # A duplicate is a draft, not a second authority over the source
            # device. The user must deliberately bind an actuator and then
            # explicitly enable Automatic control before it can operate.
            candidate["actuator"] = {}
            candidate["feedback"] = {}
            candidate["automatic_control"] = False
            normalized = validate_load_config(candidate, create_id=True)
            self._validate_actuator_binding_ownership(normalized)
            subentry = ConfigSubentry(
                data=MappingProxyType(normalized),
                subentry_type=LOAD_SUBENTRY_TYPE,
                title=normalized["display_name"],
                unique_id=normalized["load_id"],
            )
            self.hass.config_entries.async_add_subentry(self.entry, subentry)
            self._record_decision(
                "idle",
                "configuration_updated",
                f"Duplicated load {current['display_name']} as {normalized['display_name']}.",
            )
            await self._async_persist_locked()
        await self.async_replan(reason="load_duplicated")
        return normalized

    async def async_delete_load(self, load_id: str, if_revision: int | None) -> None:
        """Delete a load subentry and its integration-owned recovery data."""

        async with self._lock:
            subentry, config = self._find_load(load_id)
            self._require_revision(config, if_revision)
            self.hass.config_entries.async_remove_subentry(self.entry, subentry.subentry_id)
            self._recovery.setdefault("overrides", {}).pop(load_id, None)
            self._recovery.setdefault("load_runtime", {}).pop(load_id, None)
            self._recovery.setdefault("learning", {}).pop(load_id, None)
            self._record_decision(
                "idle", "configuration_updated", f"Deleted load {config['display_name']}."
            )
            await self._async_persist_locked()
        self._notify_update()

    async def async_start_override(
        self,
        load_id: str,
        desired_state: str,
        *,
        duration: timedelta | None = None,
        expires_at: datetime | None = None,
        indefinite: bool = False,
    ) -> dict[str, Any]:
        """Record a manual override; hardware execution remains adapter-gated."""

        if desired_state not in {"on", "off"}:
            raise ValueError("desired_state must be on or off")
        self._find_load(load_id)
        if duration is not None and expires_at is not None:
            raise ValueError("Specify duration or expires_at, not both")
        if indefinite and (duration is not None or expires_at is not None):
            raise ValueError("Indefinite override cannot have an expiry")
        if not indefinite and duration is None and expires_at is None:
            raise ValueError("Timed overrides require a duration or absolute expiry")
        now = datetime.now(UTC)
        if duration is not None:
            if duration <= timedelta(0):
                raise ValueError("Duration must be positive")
            expires_at = now + duration
        if expires_at is not None:
            if expires_at.tzinfo is None:
                raise ValueError("Absolute expiry must include a timezone")
            expires_at = expires_at.astimezone(UTC)
            if expires_at <= now:
                raise ValueError("Absolute expiry must be in the future")
        request = OverrideRequest(desired_state, expires_at, indefinite)
        async with self._lock:
            self._recovery.setdefault("overrides", {})[load_id] = {
                "desired_state": request.desired_state,
                "expires_at": request.expires_at.isoformat() if request.expires_at else None,
                "indefinite": request.indefinite,
                "created_at": now.isoformat(),
            }
            self._record_decision(
                "manual_on" if desired_state == "on" else "manual_off",
                "manual_indefinite_override" if indefinite else "manual_timed_boost",
                "Manual override recorded; hard safety limits remain enforced.",
                load_id=load_id,
            )
            await self._async_persist_locked()
        await self.async_replan(reason="manual_override")
        return self._active_overrides()[load_id]

    async def async_clear_override(self, load_id: str) -> None:
        """Clear a manual override and re-evaluate automatic policy."""

        self._find_load(load_id)
        async with self._lock:
            self._recovery.setdefault("overrides", {}).pop(load_id, None)
            self._record_decision(
                "idle", "override_cleared", "Manual override cleared.", load_id=load_id
            )
            await self._async_persist_locked()
        await self.async_replan(reason="override_cleared")

    async def async_start_actuator_test(
        self,
        load_id: str,
        *,
        duration_seconds: float,
        confirmed: bool,
    ) -> dict[str, Any]:
        """Begin an explicitly confirmed, bounded manual actuator test.

        This is intentionally separate from normal overrides: it requires a
        visible confirmation, verifies live grid headroom first, persists an
        absolute stop deadline, and always schedules a stop.  It is never
        called during setup, reload, preview, or ordinary replanning.
        """

        if not confirmed:
            raise ValueError("Actuator test requires explicit confirmation")
        if (
            isinstance(duration_seconds, bool)
            or not isinstance(duration_seconds, int | float)
            or not isfinite(float(duration_seconds))
            or not 1 <= duration_seconds <= 300
        ):
            raise ValueError("Actuator test duration must be between 1 and 300 seconds")
        async with self._lock:
            if load_id in self._actuator_test_tasks:
                raise ValueError("An actuator test is already active for this load")
            _, config = self._find_load(load_id)
            await self._async_observe_locked()
            snapshot = self._site_snapshot()
            site = self._core_site_config()
            expected_power = self._as_positive(config.get("expected_power_w"))
            if site is None or not snapshot.available or expected_power is None:
                raise ValueError(
                    "A valid hard limit, grid input, and expected load power "
                    "are required for actuator testing"
                )
            if max(0.0, snapshot.grid_import_w) + expected_power > site.hard_import_limit_w + 1e-6:
                raise ValueError("Actuator test would exceed the configured hard import limit")
            adapter = self._adapters.get(load_id)
            if adapter is None:
                raise ValueError("No configured actuator is available for this load")
            existing_feedback = self._feedback.get(load_id)
            if existing_feedback is not None and existing_feedback.confirmed_state is True:
                raise ValueError(
                    "The actuator is already confirmed on; use normal control instead of a test"
                )
            started = datetime.now(UTC)
            feedback = await adapter.async_apply(
                AdapterCommand(
                    desired_enabled=True, source="manual_test", reason_code="manual_actuator_test"
                )
            )
            self._feedback[load_id] = feedback
            self._update_runtime_from_feedback(load_id, feedback)
            if not feedback.available or feedback.confirmed_state is not True:
                # Do not leave an unconfirmed explicit test on.  This is a
                # best-effort safety stop, independently of normal replan
                # authority, because the user explicitly initiated the test.
                try:
                    stopped_feedback = await adapter.async_apply(
                        AdapterCommand(
                            desired_enabled=False,
                            source="manual_test",
                            reason_code="manual_actuator_test_unconfirmed_start",
                        )
                    )
                    self._feedback[load_id] = stopped_feedback
                    self._update_runtime_from_feedback(load_id, stopped_feedback)
                except Exception as stop_err:
                    self._record_decision(
                        "fault", "actuator_unavailable", str(stop_err), load_id=load_id
                    )
                self._recovery.setdefault("load_runtime", {}).setdefault(load_id, {})[
                    "fault_state"
                ] = "actuator_feedback_mismatch"
                self._record_decision(
                    "fault",
                    "actuator_feedback_mismatch",
                    "Manual actuator test start was not confirmed by fresh feedback.",
                    load_id=load_id,
                )
                await self._async_persist_locked()
                raise ValueError("Actuator test start was not confirmed by feedback")
            expires_at = started + timedelta(seconds=duration_seconds)
            self._recovery.setdefault("actuator_tests", {})[load_id] = {
                "started_at": started.isoformat(),
                "expires_at": expires_at.isoformat(),
                "duration_seconds": duration_seconds,
            }
            self._record_decision(
                "manual_on",
                "manual_actuator_test",
                (
                    "Explicit bounded actuator test started; it will stop automatically "
                    "at the recorded expiry."
                ),
                load_id=load_id,
            )
            await self._async_persist_locked()
            self._actuator_test_tasks[load_id] = self.hass.async_create_task(
                self._async_finish_actuator_test(load_id, expires_at),
                f"{DOMAIN}_actuator_test_{load_id}",
            )
        self._notify_update()
        return {
            "load_id": load_id,
            "started_at": started.isoformat(),
            "expires_at": expires_at.isoformat(),
            "active": True,
        }

    async def _async_finish_actuator_test(self, load_id: str, expires_at: datetime) -> None:
        """Wait only for the bounded explicit test deadline, then stop it."""

        try:
            delay = max(0.0, (expires_at - datetime.now(UTC)).total_seconds())
            await asyncio.sleep(delay)
            await self.async_stop_actuator_test(load_id, reason="manual_actuator_test_complete")
        except asyncio.CancelledError:
            raise
        except ValueError:
            # Keep the persisted test record as fault evidence until an actual
            # off feedback confirmation arrives.  The next evaluation sees
            # its expired deadline and proposes only a stop, never a renewed
            # manual start.
            self._schedule_replan("manual_actuator_test_stop_retry")

    async def async_stop_actuator_test(
        self, load_id: str, *, reason: str = "manual_actuator_test_cancelled"
    ) -> dict[str, Any]:
        """Immediately stop an active explicit actuator test and audit the result."""

        async with self._lock:
            active = self._recovery.get("actuator_tests", {})
            if not isinstance(active, Mapping) or load_id not in active:
                raise ValueError("No active actuator test exists for this load")
            task = self._actuator_test_tasks.get(load_id)
            if task is not None and task is not asyncio.current_task():
                task.cancel()
            adapter = self._adapters.get(load_id)
            if adapter is None:
                raise ValueError("No configured actuator is available for this load")
            try:
                feedback = await adapter.async_apply(
                    AdapterCommand(desired_enabled=False, source="manual_test", reason_code=reason)
                )
            except Exception as err:
                self._record_decision(
                    "fault",
                    "actuator_unavailable",
                    _REDACTED_ACTUATOR_FAILURE_MESSAGE,
                    load_id=load_id,
                )
                await self._async_persist_locked()
                raise ValueError("Actuator test stop failed") from err
            self._feedback[load_id] = feedback
            self._update_runtime_from_feedback(load_id, feedback)
            if not feedback.available or feedback.confirmed_state is not False:
                self._recovery.setdefault("load_runtime", {}).setdefault(load_id, {})[
                    "fault_state"
                ] = "actuator_feedback_mismatch"
                self._record_decision(
                    "fault",
                    "actuator_feedback_mismatch",
                    "Manual actuator test stop was not confirmed by fresh feedback.",
                    load_id=load_id,
                )
                await self._async_persist_locked()
                raise ValueError("Actuator test stop was not confirmed by feedback")
            self._recovery.setdefault("actuator_tests", {}).pop(load_id, None)
            self._actuator_test_tasks.pop(load_id, None)
            self._record_decision(
                "idle", reason, "Explicit bounded actuator test stopped.", load_id=load_id
            )
            await self._async_persist_locked()
        self._notify_update()
        self._schedule_replan("actuator_test_stopped")
        return {"load_id": load_id, "active": False, "reason_code": reason}

    async def async_set_automatic_control(
        self,
        load_id: str,
        enabled: bool,
        if_revision: int | None = None,
    ) -> dict[str, Any]:
        """Change automatic authority without changing observed physical output."""

        _, current = self._find_load(load_id)
        self._require_revision(current, if_revision)
        if bool(current["automatic_control"]) == enabled:
            return current
        result = await self.async_update_load(
            load_id,
            {"automatic_control": enabled},
            if_revision,
            _replan=False,
        )
        if enabled:
            # Enabling automatic control clears manual authority *before* the
            # first evaluation, so a stale Boost cannot be applied in between.
            async with self._lock:
                self._recovery.setdefault("overrides", {}).pop(load_id, None)
                self._record_decision(
                    "idle",
                    "override_cleared",
                    "Automatic control enabled; manual override cleared.",
                    load_id=load_id,
                )
                await self._async_persist_locked()
        else:
            async with self._lock:
                self._record_decision(
                    "not_controlled",
                    "automatic_control_disabled",
                    "Automatic control disabled without an output action.",
                    load_id=load_id,
                )
                await self._async_persist_locked()
        await self.async_replan(reason="automatic_control_changed")
        return result

    async def async_replan(
        self,
        *,
        reason: str = "manual",
        preview: bool = False,
        _site_config: Mapping[str, Any] | None = None,
        _load_configs_override: Sequence[Mapping[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """Plan, arbitrate, and only then apply authorized commands.

        Preview deliberately uses existing snapshots and never mutates runtime,
        timers, persistence, journal, or adapters. Regular evaluation observes
        first, lets the pure planner propose work, lets the site arbitrator make
        final safety/capacity decisions, and issues at most one needed command
        per load.
        """

        async with self._lock:
            now = datetime.now(UTC)
            if not preview:
                await self._async_observe_locked()
            site_config = self.site_config if _site_config is None else _site_config
            snapshot = self._site_snapshot(site_config)
            if not preview:
                self._observation_ready = snapshot.available
            site = self._core_site_config(site_config)
            configs = (
                [config for _, config in self._load_configs() if not config.get("invalid")]
                if _load_configs_override is None
                else [
                    dict(config) for config in _load_configs_override if not config.get("invalid")
                ]
            )
            automatic_requests: list[LoadRequest] = []
            for config in configs:
                if config.get("load_id") in self._conflicting_actuator_load_ids:
                    continue
                if not config.get("enabled", True) or not config.get("automatic_control"):
                    continue
                if str(config.get("optimisation_mode")) in {"disabled", "manual"}:
                    continue
                request = self._load_request(
                    config,
                    self._feedback.get(config["load_id"]),
                    now,
                    site_config=site_config,
                    recovery=self._recovery,
                )
                if request is not None and not self._battery_blocks_discretionary(
                    site_config, snapshot, request
                ):
                    automatic_requests.append(request)

            serialized_plan: dict[str, Any]
            planned_load_ids: set[str] = set()
            if site is not None:
                pure_plan = self._planner.plan(
                    PlanningInput(
                        now=now,
                        site=site,
                        requests=tuple(automatic_requests),
                        tariffs=self._tariff_timeline(now, site_config),
                    )
                )
                serialized_plan = self._serialize_plan_result(pure_plan)
                planned_load_ids = {
                    interval.load_id
                    for interval in pure_plan.intervals
                    if interval.start_at <= now < interval.end_at
                }
            else:
                serialized_plan = {
                    "generated_at": now.isoformat(),
                    "horizon_end_at": None,
                    "slot_seconds": 300,
                    "intervals": [],
                    "loads": [],
                    "warnings": ["configuration_invalid"],
                    "next_action": None,
                    "preview_only": preview,
                }

            overrides = self._active_overrides(purge_expired=not preview, at=now)
            active_tests = self._recovery.get("actuator_tests", {})
            active_tests = active_tests if isinstance(active_tests, Mapping) else {}
            desired: dict[str, tuple[bool, CommandSource, float | None]] = {}
            live_requests: list[LoadRequest] = []
            request_by_load: dict[str, LoadRequest] = {}
            expired_actuator_tests: set[str] = set()
            for config in configs:
                load_id = str(config["load_id"])
                if load_id in self._conflicting_actuator_load_ids:
                    continue
                feedback = self._feedback.get(load_id)
                override = overrides.get(load_id)
                if load_id in active_tests:
                    test = active_tests.get(load_id)
                    expires_at = (
                        self._parse_deadline(test.get("expires_at"))
                        if isinstance(test, Mapping)
                        else None
                    )
                    if expires_at is None or expires_at <= now:
                        # A delayed/cancelled test timer must fail toward a
                        # stop. This remains true even if an automatic policy
                        # is disabled or normal inputs have gone stale.
                        expired_actuator_tests.add(load_id)
                        desired[load_id] = (False, CommandSource.MANUAL, None)
                        continue
                    # An explicitly confirmed bounded test is a manual request
                    # for arbitration purposes.  Replanning must not silently
                    # cancel it; its own timer/stop path remains authoritative.
                    request = self._load_request(
                        config,
                        feedback,
                        now,
                        source=CommandSource.MANUAL,
                        site_config=site_config,
                        recovery=self._recovery,
                    )
                    if request is not None:
                        live_requests.append(request)
                        request_by_load[load_id] = request
                    continue
                if override and override.get("desired_state") == "off":
                    desired[load_id] = (False, CommandSource.MANUAL, None)
                    continue
                if override and override.get("desired_state") == "on":
                    request = self._load_request(
                        config,
                        feedback,
                        now,
                        source=CommandSource.MANUAL,
                        site_config=site_config,
                        recovery=self._recovery,
                    )
                    if request is not None:
                        live_requests.append(request)
                        request_by_load[load_id] = request
                    continue
                if self._should_run_now(
                    config,
                    feedback,
                    snapshot,
                    now,
                    planned_load_ids,
                    persist_solar_state=not preview,
                    site_config=site_config,
                    recovery=self._recovery,
                ):
                    request = self._load_request(
                        config,
                        feedback,
                        now,
                        site_config=site_config,
                        recovery=self._recovery,
                    )
                    if request is not None and not self._battery_blocks_discretionary(
                        site_config, snapshot, request
                    ):
                        live_requests.append(request)
                        request_by_load[load_id] = request
                    elif (
                        config.get("enabled", True)
                        and config.get("automatic_control")
                        and snapshot.available
                    ):
                        desired[load_id] = (False, CommandSource.AUTOMATIC, None)
                elif (
                    config.get("enabled", True)
                    and config.get("automatic_control")
                    and snapshot.available
                ):
                    # Automatic authority may turn its own prior output off;
                    # unavailable inputs deliberately preserve observed state.
                    desired[load_id] = (False, CommandSource.AUTOMATIC, None)

            allocations: dict[str, Any] = {}
            if site is not None and live_requests:
                # Only output which is actively represented in this allocation
                # can be removed from the grid baseline.  A disabled/unmanaged
                # load remains uncontrolled consumption until a later observed
                # state proves otherwise; this is conservative by design.
                managed_power = sum(
                    max(0.0, feedback.active_power_w or 0.0)
                    for load_id, feedback in self._feedback.items()
                    if load_id in request_by_load and feedback.confirmed_state
                )
                existing_binary_load_count = sum(
                    1
                    for config in configs
                    if str(config["load_id"]) not in request_by_load
                    and not self._is_variable_load(config)
                    and (feedback := self._feedback.get(str(config["load_id"]))) is not None
                    and feedback.confirmed_state is True
                )
                arbitration = self._arbitrator.arbitrate(
                    ArbitrationInput(
                        at=now,
                        site=site,
                        snapshot=snapshot,
                        requests=tuple(live_requests),
                        observation_ready=self._observation_ready,
                        uncontrolled_import_w=max(0.0, snapshot.grid_import_w - managed_power),
                        available_solar_w=max(0.0, -snapshot.grid_import_w),
                        max_input_age_s=float(site_config.get("sensor_stale_seconds", 900)),
                        existing_binary_load_count=existing_binary_load_count,
                    )
                )
                allocations = {
                    allocation.load_id: allocation for allocation in arbitration.allocations
                }
                for load_id, request in request_by_load.items():
                    allocation = allocations[load_id]
                    desired[load_id] = (
                        allocation.accepted,
                        request.control_source,
                        allocation.granted_w if allocation.accepted else None,
                    )

            proposals: list[dict[str, Any]] = []
            hard_safety_ok = (
                site is not None
                and snapshot.available
                and snapshot.grid_import_w <= site.hard_import_limit_w
            )

            def _proposal_order(config: Mapping[str, Any]) -> tuple[int, str]:
                load_id = str(config["load_id"])
                enabled, _, granted = desired.get(load_id, (True, CommandSource.AUTOMATIC, None))
                feedback = self._feedback.get(load_id)
                if not enabled:
                    return (0, load_id)  # release capacity before any start
                if (
                    self._is_variable_load(config)
                    and feedback
                    and feedback.confirmed_state
                    and granted is not None
                ):
                    if granted + 1e-6 < max(0.0, feedback.active_power_w or 0.0):
                        return (1, load_id)  # throttle before binary starts
                return (2, load_id)

            for config in sorted(configs, key=_proposal_order):
                load_id = str(config["load_id"])
                decision = desired.get(load_id)
                if decision is None:
                    continue
                enabled, source, granted = decision
                allocation = allocations.get(load_id)
                proposal_reason = (
                    allocation.reasons[0].value
                    if allocation is not None and allocation.reasons
                    else (
                        "manual_timed_boost"
                        if source is CommandSource.MANUAL
                        else "plan_not_selected"
                    )
                )
                applied = False
                result_reason = proposal_reason
                if not preview:
                    applied, result_reason = await self._async_apply_authorized(
                        load_id=load_id,
                        config=config,
                        desired_enabled=enabled,
                        source=source,
                        granted_power_w=granted,
                        hard_safety_ok=hard_safety_ok,
                    )
                proposals.append(
                    {
                        "load_id": load_id,
                        "desired_enabled": enabled,
                        "source": source.value,
                        "granted_power_w": granted,
                        "authorized": bool(allocation.accepted)
                        if allocation is not None
                        else source is CommandSource.MANUAL,
                        "applied": applied,
                        "reason_code": result_reason,
                    }
                )

            if not preview and expired_actuator_tests:
                persisted_tests = self._recovery.get("actuator_tests", {})
                if isinstance(persisted_tests, dict):
                    for load_id in expired_actuator_tests:
                        feedback = self._feedback.get(load_id)
                        if (
                            feedback is None
                            or not feedback.available
                            or feedback.confirmed_state is not False
                        ):
                            continue
                        if persisted_tests.pop(load_id, None) is not None:
                            task = self._actuator_test_tasks.pop(load_id, None)
                            if task is not None and task is not asyncio.current_task():
                                task.cancel()
                            self._record_decision(
                                "idle",
                                "manual_actuator_test_complete",
                                "An expired actuator test was confirmed stopped.",
                                load_id=load_id,
                            )

            result = {
                **serialized_plan,
                "reason": reason,
                "proposals": proposals,
                "warnings": serialized_plan.get("warnings", [])
                + self._current_warnings(
                    overrides=overrides, site_config=site_config, configs=configs
                ),
                "preview_only": preview,
            }
            if not preview:
                self._last_plan = result
                self._last_replan_at = now
                self._recovery["last_plan"] = result
                self._record_decision(
                    "idle", "replanned", f"Plan recalculated ({reason}) after safety arbitration."
                )
                await self._async_persist_locked()
        if not preview:
            self._notify_update()
        return result

    async def async_preview(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        """Validate prospective configuration and return a never-actuating preview."""

        try:
            site_config, load_configs, response_config = self._candidate_preview_configuration(
                payload
            )
        except ConfigurationValidationError as err:
            return {
                "valid": False,
                "issues": serialize_issues(err),
                "plan": None,
                "preview_only": True,
            }
        except (KeyError, LoadNotFoundError) as err:
            return {
                "valid": False,
                "issues": [{"path": "load_id", "code": "not_found", "message": str(err)}],
                "plan": None,
                "preview_only": True,
            }
        plan = await self.async_replan(
            reason="preview",
            preview=True,
            _site_config=site_config,
            _load_configs_override=load_configs,
        )
        return {
            "valid": True,
            "issues": [],
            "config": response_config,
            "plan": plan,
            "preview_only": True,
        }

    def _candidate_preview_configuration(
        self,
        payload: Mapping[str, Any],
    ) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any]]:
        """Build a fully validated non-persistent configuration candidate.

        The panel may preview a partial site/load edit, a new load, or a whole
        staged configuration.  This method is intentionally synchronous and
        side-effect free: it reads config-subentries but never updates them,
        creates adapters, records a journal item, or changes recovery state.
        """

        kind = payload.get("kind")
        raw_config = payload.get("config", {})
        if raw_config is None:
            raw_config = {}
        if not isinstance(raw_config, Mapping):
            raise ConfigurationValidationError(
                [
                    # Reuse the public issue shape without leaking a TypeError.
                    ValidationIssue("config", "invalid_object", "Configuration must be an object.")
                ]
            )

        current_site = self.site_config
        current_loads = [
            dict(config) for _, config in self._load_configs() if not config.get("invalid")
        ]
        if kind == "site":
            candidate_site = dict(current_site)
            candidate_site.update(dict(raw_config))
            site = validate_site_config(candidate_site)
            self._validate_preview_actuator_bindings(current_loads)
            return site, current_loads, {"kind": "site", "config": site}

        if kind == "load":
            requested_load_id = payload.get("load_id") or raw_config.get("load_id")
            candidate_load: dict[str, Any]
            load_index: int | None = None
            if isinstance(requested_load_id, str):
                for index, load in enumerate(current_loads):
                    if load.get("load_id") == requested_load_id:
                        candidate_load = dict(load)
                        load_index = index
                        break
                else:
                    # A supplied UUID can also represent a staged new load.
                    candidate_load = {}
                candidate_load.update(dict(raw_config))
                candidate_load["load_id"] = requested_load_id
                normalized_load = validate_load_config(candidate_load, create_id=load_index is None)
            else:
                normalized_load = validate_load_config(dict(raw_config), create_id=True)
            candidate_loads = list(current_loads)
            if load_index is None:
                candidate_loads.append(normalized_load)
            else:
                candidate_loads[load_index] = normalized_load
            self._validate_preview_actuator_bindings(candidate_loads)
            return current_site, candidate_loads, {"kind": "load", "config": normalized_load}

        if kind == "full":
            raw_site = payload.get("site", raw_config.get("site", {}))
            raw_loads = payload.get("loads", raw_config.get("loads", []))
            if not isinstance(raw_site, Mapping) or not isinstance(raw_loads, list):
                raise ConfigurationValidationError(
                    [
                        ValidationIssue(
                            "", "invalid_object", "A full preview requires site and loads objects."
                        )
                    ]
                )
            merged_site = dict(current_site)
            merged_site.update(dict(raw_site))
            site = validate_site_config(merged_site)
            by_id = {
                str(load.get("load_id")): load
                for load in current_loads
                if isinstance(load.get("load_id"), str)
            }
            normalized_loads: list[dict[str, Any]] = []
            for index, raw_load in enumerate(raw_loads):
                if not isinstance(raw_load, Mapping):
                    raise ConfigurationValidationError(
                        [
                            ValidationIssue(
                                f"loads[{index}]", "invalid_object", "Each load must be an object."
                            )
                        ]
                    )
                load_id = raw_load.get("load_id")
                merged_load = dict(by_id.get(str(load_id), {}))
                merged_load.update(dict(raw_load))
                normalized_loads.append(
                    validate_load_config(merged_load, create_id=not isinstance(load_id, str))
                )
            self._validate_preview_actuator_bindings(normalized_loads)
            return site, normalized_loads, {"kind": "full", "site": site, "loads": normalized_loads}

        raise ConfigurationValidationError(
            [ValidationIssue("kind", "invalid_kind", "Use site, load, or full.")]
        )

    async def async_skip_operational_day(self, load_id: str) -> None:
        """Record an explicit skip without falsifying completed accounting."""

        self._find_load(load_id)
        async with self._lock:
            operational_day, _ = self._operational_day_at(datetime.now(UTC))
            self._recovery.setdefault("load_runtime", {}).setdefault(load_id, {})[
                "skipped_operational_day"
            ] = operational_day
            self._record_decision(
                "idle",
                "operational_day_skipped",
                "Operational day target explicitly skipped.",
                load_id=load_id,
            )
            await self._async_persist_locked()
        self._notify_update()

    async def async_reset_daily_accounting(self, *, confirmed: bool) -> None:
        """Reset only integration summaries after explicit confirmation."""

        if not confirmed:
            raise ValueError("Daily accounting reset requires confirmed=true")
        async with self._lock:
            self._recovery["daily_summaries"] = {}
            runtime_by_load = self._recovery.get("load_runtime", {})
            if isinstance(runtime_by_load, Mapping):
                for runtime in runtime_by_load.values():
                    if not isinstance(runtime, dict):
                        continue
                    for field in (
                        "runtime_today_h",
                        "confirmed_runtime_today_h",
                        "energy_today_kwh",
                        "cost_today",
                        "starts_today",
                    ):
                        runtime[field] = 0
                    runtime["energy_provenance"] = "reset_by_user"
                    runtime["cost_provenance"] = "reset_by_user"
            self._record_decision(
                "idle", "daily_accounting_reset", "Daily accounting reset by explicit request."
            )
            await self._async_persist_locked()
        self._notify_update()

    async def async_export_decision_report(self, load_id: str | None = None) -> dict[str, Any]:
        """Return a bounded, redacted decision report."""

        if load_id is not None:
            self._find_load(load_id)
        stored_journal = self._recovery.get("decision_journal", [])
        journal = (
            [
                self._public_journal_event(event)
                for event in stored_journal
                if isinstance(event, Mapping)
                and (load_id is None or event.get("load_id") == load_id)
            ]
            if isinstance(stored_journal, list)
            else []
        )
        return {
            "entry_id": self.entry.entry_id,
            "generated_at": datetime.now(UTC).isoformat(),
            "load_id": load_id,
            "integration_state": "started" if self._started else "stopped",
            "plan": self._last_plan,
            "events": journal[-100:],
            "redacted": True,
        }

    async def async_historical_summary(self, load_id: str | None = None) -> dict[str, Any]:
        """Return compact integration summaries; detailed history remains Recorder-owned."""

        if load_id is not None:
            self._find_load(load_id)
        summaries = self._recovery.get("daily_summaries", {})
        if not isinstance(summaries, Mapping):
            summaries = {}
        result: list[dict[str, Any]] = []
        for day, by_load in sorted(summaries.items()):
            if not isinstance(day, str) or not isinstance(by_load, Mapping):
                continue
            if load_id is not None:
                summary = by_load.get(load_id)
                if isinstance(summary, Mapping):
                    result.append({"operational_day": day, "load_id": load_id, **dict(summary)})
                continue
            for item_load_id, summary in sorted(by_load.items()):
                if isinstance(item_load_id, str) and isinstance(summary, Mapping):
                    result.append(
                        {"operational_day": day, "load_id": item_load_id, **dict(summary)}
                    )
        return {
            "daily_summaries": result,
            "data_quality": "integration_recovery_summary; detailed history is in Recorder",
        }

    async def async_learning_status(self, load_id: str | None = None) -> dict[str, Any]:
        """Return bounded learning state without exposing raw sensor history."""

        learning = self._mapping_or_empty(self._recovery.get("learning"))
        if load_id is not None:
            self._find_load(load_id)
            return {"load_id": load_id, "learning": learning.get(load_id, {})}
        return {"loads": learning}

    async def async_reset_learning(self, load_id: str) -> None:
        """Forget learned values while retaining configured estimates and limits."""

        self._find_load(load_id)
        async with self._lock:
            self._recovery_mapping("learning").pop(load_id, None)
            self._record_decision(
                "idle",
                "learning_reset",
                "Learned estimate reset to configured baseline.",
                load_id=load_id,
            )
            await self._async_persist_locked()
        self._notify_update()

    async def async_set_learning_frozen(self, load_id: str, frozen: bool) -> dict[str, Any]:
        """Freeze or resume estimate updates without changing configured limits."""

        self._find_load(load_id)
        async with self._lock:
            learning = self._recovery_mapping("learning")
            raw = self._mapping_or_empty(learning.get(load_id))
            samples = tuple(
                LearningSample(
                    observed_at=stamp,
                    power_w=self._nonnegative_number(item.get("power_w")),
                    duration_s=self._nonnegative_number(item.get("duration_s")),
                    feedback_valid=bool(item.get("feedback_valid", True)),
                )
                for item in raw.get("samples", [])
                if isinstance(item, Mapping)
                and (stamp := self._parse_deadline(item.get("observed_at"))) is not None
            )
            state = LearningState(
                samples=samples,
                ewma_power_w=self._as_nonnegative(raw.get("ewma_power_w")),
                ewma_duration_s=self._as_nonnegative(raw.get("ewma_duration_s")),
                frozen=bool(raw.get("frozen", False)),
            )
            updated = set_learning_frozen(state, frozen)
            merged = dict(raw)
            merged["frozen"] = updated.frozen
            merged["samples"] = [
                {
                    "observed_at": sample.observed_at.isoformat(),
                    "power_w": sample.power_w,
                    "duration_s": sample.duration_s,
                    "feedback_valid": sample.feedback_valid,
                }
                for sample in updated.samples
            ]
            merged["ewma_power_w"] = updated.ewma_power_w
            merged["ewma_duration_s"] = updated.ewma_duration_s
            learning[load_id] = merged
            self._record_decision(
                "idle",
                "learning_frozen" if frozen else "learning_resumed",
                "Learning updates were frozen." if frozen else "Learning updates resumed.",
                load_id=load_id,
            )
            await self._async_persist_locked()
        self._notify_update()
        return {"load_id": load_id, "frozen": frozen}

    def _active_overrides(
        self,
        *,
        purge_expired: bool = False,
        at: datetime | None = None,
    ) -> dict[str, dict[str, Any]]:
        """Return active absolute-time overrides without mutating read/preview paths.

        ``purge_expired`` is reserved for a normal, locked control/recovery
        transaction which will persist the cleanup.  UI reads and previews only
        filter expired records; they never alter recovery state or journal.
        """

        now = datetime.now(UTC) if at is None else at.astimezone(UTC)
        active: dict[str, dict[str, Any]] = {}
        overrides = self._recovery.get("overrides", {})
        if not isinstance(overrides, Mapping):
            return active
        for load_id, raw in list(overrides.items()):
            if not isinstance(raw, Mapping):
                if purge_expired:
                    self._recovery.setdefault("overrides", {}).pop(load_id, None)
                continue
            expiry_text = raw.get("expires_at")
            if expiry_text:
                expiry = self._parse_deadline(expiry_text)
                if expiry is None:
                    if purge_expired:
                        self._recovery.setdefault("overrides", {}).pop(load_id, None)
                    continue
                if expiry <= now:
                    if purge_expired:
                        self._recovery.setdefault("overrides", {}).pop(load_id, None)
                        self._record_decision(
                            "idle", "override_expired", "Timed override expired.", load_id=load_id
                        )
                    continue
            active[load_id] = dict(raw)
        return active

    def _load_state(self, config: Mapping[str, Any], override: Mapping[str, Any] | None) -> str:
        if config.get("invalid"):
            return "fault"
        if config.get("load_id") in self._conflicting_actuator_load_ids:
            return "fault"
        if override:
            return "manual_on" if override.get("desired_state") == "on" else "manual_off"
        if not config.get("automatic_control"):
            return "not_controlled"
        return "idle"

    def _load_reason(self, config: Mapping[str, Any], override: Mapping[str, Any] | None) -> str:
        if config.get("invalid"):
            return "configuration_invalid"
        if config.get("load_id") in self._conflicting_actuator_load_ids:
            return "duplicate_actuator_binding"
        if override:
            return (
                "manual_indefinite_override" if override.get("indefinite") else "manual_timed_boost"
            )
        if not config.get("automatic_control"):
            return "automatic_control_disabled"
        return "restart_stabilisation" if not self._started else "waiting_for_plan"

    def _load_runtime_fault(self, load_id: object) -> str | None:
        """Return the persisted runtime fault code for a configured load, if any."""

        if not isinstance(load_id, str):
            return None
        runtime = self._mapping_or_empty(
            self._mapping_or_empty(self._recovery.get("load_runtime")).get(load_id)
        )
        fault_state = runtime.get("fault_state")
        return fault_state if isinstance(fault_state, str) and fault_state else None

    def _plan_for_load(self, load_id: str) -> list[dict[str, Any]]:
        if not self._last_plan:
            return []
        intervals = self._last_plan.get("intervals")
        if not isinstance(intervals, list):
            return []
        return [
            dict(item)
            for item in intervals
            if isinstance(item, Mapping) and item.get("load_id") == load_id
        ]

    def _current_warnings(
        self,
        *,
        overrides: Mapping[str, Mapping[str, Any]] | None = None,
        site_config: Mapping[str, Any] | None = None,
        configs: Sequence[Mapping[str, Any]] | None = None,
    ) -> list[dict[str, str]]:
        """Build a read-only safety summary suitable for panel and diagnostics."""

        warnings: list[dict[str, str]] = []
        config = self.site_config if site_config is None else site_config
        load_configs = (
            [item for _, item in self._load_configs()]
            if configs is None
            else [dict(item) for item in configs]
        )
        invalid = [item for item in load_configs if item.get("invalid")]
        if invalid:
            warnings.append(
                {
                    "code": "configuration_invalid",
                    "message": "One or more load configurations require repair.",
                }
            )
        if self._conflicting_actuator_load_ids:
            warnings.append(
                {
                    "code": "duplicate_actuator_binding",
                    "message": "Multiple loads declare the same actuator target.",
                }
            )
        current_overrides = self._active_overrides() if overrides is None else overrides
        if any(value.get("indefinite") for value in current_overrides.values()):
            warnings.append(
                {
                    "code": "manual_indefinite_override",
                    "message": "An indefinite manual override is active.",
                }
            )
        if self._core_site_config(config) is None:
            warnings.append(
                {
                    "code": "configuration_invalid",
                    "message": "Automatic control requires a positive hard import limit.",
                }
            )
        if not self._site_snapshot(config).available:
            warnings.append(
                {
                    "code": "input_missing",
                    "message": "Grid input is unavailable or stale; automatic starts are paused.",
                }
            )
        return warnings

    def _attention_items(
        self,
        *,
        overrides: Mapping[str, Mapping[str, Any]] | None = None,
        site_config: Mapping[str, Any] | None = None,
        configs: Sequence[Mapping[str, Any]] | None = None,
        warnings: Sequence[Mapping[str, str]] | None = None,
    ) -> list[dict[str, Any]]:
        """Build backend-ranked display attention without changing control policy."""

        config = self.site_config if site_config is None else site_config
        load_configs = (
            [item for _, item in self._load_configs()]
            if configs is None
            else [dict(item) for item in configs]
        )
        current_warnings = (
            self._current_warnings(overrides=overrides, site_config=config, configs=load_configs)
            if warnings is None
            else list(warnings)
        )
        current_overrides = self._active_overrides() if overrides is None else overrides
        load_names = {
            str(item.get("load_id")): str(
                item.get("display_name") or item.get("name") or item.get("load_id")
            )
            for item in load_configs
            if item.get("load_id")
        }
        items: list[dict[str, Any]] = []
        seen: set[str] = set()

        def add(
            *,
            item_id: str,
            code: str,
            rank: int,
            severity: str,
            affected_kind: str,
            affected_id: str | None = None,
            display_name: str | None = None,
            action: str | None = None,
            reason_code: str | None = None,
        ) -> None:
            if item_id in seen:
                return
            seen.add(item_id)
            item: dict[str, Any] = {
                "id": item_id,
                "code": code,
                "rank": rank,
                "severity": severity,
                "affected_kind": affected_kind,
                "reason_code": reason_code or code,
            }
            if affected_id is not None:
                item["affected_id"] = affected_id
            if display_name is not None:
                item["display_name"] = display_name
            if action is not None:
                item["action"] = action
            items.append(item)

        for index, load_config in enumerate(load_configs):
            display_name = str(
                load_config.get("display_name")
                or load_config.get("name")
                or load_config.get("load_id")
                or "Load"
            )
            load_id = load_config.get("load_id")
            load_id_text = load_id if isinstance(load_id, str) else None
            if load_config.get("invalid"):
                add(
                    item_id=(
                        f"load:{load_id_text}:load_configuration_invalid"
                        if load_id_text
                        else f"load:invalid:{index}:load_configuration_invalid"
                    ),
                    code="load_configuration_invalid",
                    rank=9,
                    severity="warning",
                    affected_kind="load",
                    affected_id=load_id_text,
                    display_name=display_name,
                    action="settings",
                )
                continue
            runtime_fault = self._load_runtime_fault(load_id_text)
            if runtime_fault is not None:
                add(
                    item_id=f"load:{load_id_text}:{runtime_fault}",
                    code=runtime_fault,
                    rank=1,
                    severity="critical",
                    affected_kind="load",
                    affected_id=load_id_text,
                    display_name=display_name,
                    action="load_detail",
                    reason_code=runtime_fault,
                )

        for load_id in sorted(self._conflicting_actuator_load_ids):
            add(
                item_id=f"load:{load_id}:duplicate_actuator_binding",
                code="duplicate_actuator_binding",
                rank=1,
                severity="critical",
                affected_kind="load",
                affected_id=load_id,
                display_name=load_names.get(load_id, load_id),
                action="settings",
            )

        for load_id, override in sorted(current_overrides.items()):
            indefinite = bool(override.get("indefinite"))
            code = "manual_indefinite_override" if indefinite else "manual_timed_boost"
            add(
                item_id=f"load:{load_id}:{code}",
                code=code,
                rank=5 if indefinite else 7,
                severity="warning" if indefinite else "info",
                affected_kind="load",
                affected_id=str(load_id),
                display_name=load_names.get(str(load_id), str(load_id)),
                action="load_detail",
            )

        for index, warning in enumerate(current_warnings):
            code = str(warning.get("code") or "unknown_attention")
            if code == "manual_indefinite_override":
                continue
            if code == "duplicate_actuator_binding":
                if self._conflicting_actuator_load_ids:
                    continue
                add(
                    item_id="site:duplicate_actuator_binding",
                    code=code,
                    rank=1,
                    severity="critical",
                    affected_kind="site",
                    display_name=str(config.get("site_name", "site")),
                    action="settings",
                )
            elif code == "input_missing":
                add(
                    item_id="site:input_missing",
                    code=code,
                    rank=6,
                    severity="warning",
                    affected_kind="site",
                    display_name=str(config.get("site_name", "site")),
                    action="diagnostics",
                )
            elif code == "configuration_invalid":
                add(
                    item_id="site:configuration_invalid",
                    code=code,
                    rank=9,
                    severity="warning",
                    affected_kind="site",
                    display_name=str(config.get("site_name", "site")),
                    action="settings",
                )
            else:
                add(
                    item_id=f"site:{code}:{index}",
                    code=code,
                    rank=10,
                    severity="info",
                    affected_kind="site",
                    display_name=str(config.get("site_name", "site")),
                    action="diagnostics",
                )

        return sorted(
            items,
            key=lambda item: (
                int(item["rank"]),
                str(item.get("affected_kind", "")),
                str(item.get("affected_id", "")),
                str(item["code"]),
            ),
        )

    def _record_decision(
        self, state: str, reason_code: str, message: str, *, load_id: str | None = None
    ) -> None:
        journal = self._recovery_list("decision_journal")
        journal.append(
            {
                "timestamp": datetime.now(UTC).isoformat(),
                "state": state,
                "reason_code": reason_code,
                "message": message,
                "load_id": load_id,
                "configuration_revision": self.config_revision if self.entry.options else 0,
            }
        )
        limit = int(self.site_config.get("decision_journal_limit", DEFAULT_DECISION_JOURNAL_LIMIT))
        del journal[: -max(1, min(limit, 5000))]

    @staticmethod
    def _public_journal_event(event: Mapping[str, Any]) -> dict[str, Any]:
        """Return a bounded report event without stale raw adapter errors.

        Older recovery records may already contain exceptions emitted by an HA
        service or a device integration.  Those messages can include entity
        IDs, action data, or provider details, so reports/CSV must never pass
        them through even after an upgrade.
        """

        reason_code = str(event.get("reason_code", "unknown"))
        message = str(event.get("message", ""))
        if reason_code == "actuator_unavailable":
            message = _REDACTED_ACTUATOR_FAILURE_MESSAGE
        load_id = event.get("load_id")
        revision = event.get("configuration_revision")
        return {
            "timestamp": str(event.get("timestamp", "")),
            "state": str(event.get("state", "unknown")),
            "reason_code": reason_code,
            "message": message,
            "load_id": load_id if isinstance(load_id, str) else None,
            "configuration_revision": revision if isinstance(revision, int) else 0,
        }

    async def _async_persist_locked(self) -> None:
        self._recovery["last_plan"] = self._last_plan
        self._recovery["decision_journal_limit"] = self.site_config.get(
            "decision_journal_limit", DEFAULT_DECISION_JOURNAL_LIMIT
        )
        await self._store.async_save_site(self.entry.entry_id, self._recovery)

    @staticmethod
    def _require_revision(config: Mapping[str, Any], if_revision: int | None) -> None:
        if if_revision is None:
            return
        if int(config.get("config_revision", 0)) != if_revision:
            raise ConfigConflictError("Configuration changed in another session")

    def _notify_update(self) -> None:
        async_dispatcher_send(self.hass, f"{UPDATE_SIGNAL}_{self.entry.entry_id}")


def get_coordinator(hass: HomeAssistant, entry_id: str) -> SiteCoordinator:
    """Look up a started site runtime or raise a safe, user-facing error."""

    domain_data = hass.data.get(DOMAIN)
    runtimes = domain_data.get("runtimes") if isinstance(domain_data, Mapping) else None
    runtime = runtimes.get(entry_id) if isinstance(runtimes, Mapping) else None
    if isinstance(runtime, SiteCoordinator):
        return runtime
    raise KeyError(f"Unknown Load Control site {entry_id}")
