"""Canonical, Home Assistant-independent configuration validation.

The config flow, config-subentry flow, action/WebSocket boundary, and panel all
use this module.  It deliberately accepts incomplete *draft* adapters (so a
user can save a load while working through the wizard), but never lets an
incomplete adapter acquire control authority: the adapter factory produces an
observation-only ``NullAdapter`` for it.

Values are normalised at this boundary to the internal units used by the core:
watts, watt-hours, seconds, local wall-clock schedule definitions, and price
unit declarations.  No Home Assistant objects are imported here.
"""

from __future__ import annotations

import json
from collections.abc import Iterable, Mapping
from copy import deepcopy
from dataclasses import dataclass
from datetime import UTC, datetime, time
from math import isfinite
from typing import Any, Final
from uuid import UUID, uuid4

from .const import (
    CONFIG_SCHEMA_VERSION,
    DEFAULT_OPERATIONAL_DAY_BOUNDARY,
    DEFAULT_PLANNING_HORIZON_HOURS,
    DEFAULT_PLANNING_RESOLUTION_SECONDS,
    GRID_SIGN_CONVENTIONS,
    LOAD_TYPES,
    OPTIMISATION_MODES,
    PHASE_ASSIGNMENTS,
)


@dataclass(frozen=True, slots=True)
class ValidationIssue:
    """A stable, serializable configuration validation issue."""

    path: str
    code: str
    message: str


class ConfigurationValidationError(ValueError):
    """Raised when a configuration cannot be safely accepted."""

    def __init__(self, issues: list[ValidationIssue]) -> None:
        super().__init__("Configuration validation failed")
        self.issues = issues


PRICE_UNITS: Final[frozenset[str]] = frozenset(
    {"currency_per_kwh", "cents_per_kwh", "currency_per_mwh", "currency_per_wh"}
)
ADAPTER_TYPES: Final[frozenset[str]] = frozenset({"switch", "action_pair", "variable_number"})
REQUIREMENT_COMBINATIONS: Final[frozenset[str]] = frozenset(
    {"none", "all_of", "any_of", "primary_with_guard"}
)


SITE_DEFAULTS: Final[dict[str, Any]] = {
    "schema_version": CONFIG_SCHEMA_VERSION,
    "config_revision": 0,
    "site_name": "Load Control",
    "grid_sign_convention": "import_positive",
    "operational_day_boundary": DEFAULT_OPERATIONAL_DAY_BOUNDARY,
    "planning_horizon_hours": DEFAULT_PLANNING_HORIZON_HOURS,
    "planning_resolution_seconds": DEFAULT_PLANNING_RESOLUTION_SECONDS,
    "safety_margin_seconds": 900,
    "soft_import_limit_w": None,
    "hard_import_limit_w": None,
    "max_controlled_power_w": None,
    "max_simultaneous_binary_loads": None,
    "start_stagger_seconds": 30,
    "sensor_stale_seconds": 900,
    "price_stale_seconds": 3600,
    "decision_journal_limit": 500,
    "history_retention_days": 90,
    "grid_power_entity_id": None,
    "grid_import_entity_id": None,
    "grid_export_entity_id": None,
    "solar_power_entity_id": None,
    "phase_power_entity_ids": {},
    "phase_limits_w": {},
    "battery": {},
    "tariff_name": None,
    "tariff_mode": "fixed",
    "fixed_import_price": None,
    "fixed_import_price_unit": "currency_per_kwh",
    "current_price_entity_id": None,
    "current_price_unit": "currency_per_kwh",
    "future_price_entity_id": None,
    "future_price_attribute": None,
    "tou_periods": [],
    "feed_in_tariff": None,
    "feed_in_tariff_unit": "currency_per_kwh",
    "feed_in_entity_id": None,
    "feed_in_entity_unit": "currency_per_kwh",
    "battery_penalty_per_kwh": 0,
    "free_energy_periods": [],
    "forecast_entities": {},
    "notification_actions": [],
    "manual_may_exceed_soft_limit": False,
    "default_optimisation_mode": "cost_optimised_hybrid",
    "dashboard_preferences": {},
    "feature_flags": {},
}

LOAD_DEFAULTS: Final[dict[str, Any]] = {
    "schema_version": CONFIG_SCHEMA_VERSION,
    "config_revision": 0,
    "load_id": None,
    "display_name": "New load",
    "load_type": "generic_binary",
    "area_id": None,
    "icon": None,
    "enabled": True,
    "automatic_control": True,
    "optimisation_mode": "cost_optimised_hybrid",
    "priority": 50,
    "phase_assignment": "unknown",
    "phase_count": 1,
    "expected_power_w": 0,
    "estimated_power_per_phase_w": None,
    "efficiency": 1,
    "actuator": {},
    "feedback": {},
    "requirements": {"combination": "none"},
    "schedule_windows": [],
    "solar": {},
    "safety": {},
    "boost_presets": [],
    "learning": {"enabled": True},
    "notifications": {},
}


def _issue(issues: list[ValidationIssue], path: str, code: str, message: str) -> None:
    issues.append(ValidationIssue(path, code, message))


def _mapping(value: object, issues: list[ValidationIssue], path: str) -> dict[str, Any]:
    """Return a copied mapping and turn malformed nested objects into issues."""

    if not isinstance(value, Mapping):
        _issue(issues, path, "invalid_object", "A configuration object is required.")
        return {}
    return deepcopy(dict(value))


def _finite_number(
    value: object,
    issues: list[ValidationIssue],
    path: str,
    *,
    minimum: float | None = None,
    maximum: float | None = None,
    allow_none: bool = True,
) -> float | None:
    if value is None:
        if not allow_none:
            _issue(issues, path, "required", "A numeric value is required.")
        return None
    if isinstance(value, bool) or not isinstance(value, int | float):
        _issue(issues, path, "invalid_number", "A finite numeric value is required.")
        return None
    number = float(value)
    if not isfinite(number):
        _issue(issues, path, "invalid_number", "A finite numeric value is required.")
        return None
    if minimum is not None and number < minimum:
        _issue(issues, path, "out_of_range", f"Value must be at least {minimum:g}.")
    if maximum is not None and number > maximum:
        _issue(issues, path, "out_of_range", f"Value must be at most {maximum:g}.")
    return number


def _positive_number(
    value: object, issues: list[ValidationIssue], path: str, *, allow_zero: bool = False
) -> float | None:
    return _finite_number(value, issues, path, minimum=0 if allow_zero else 1)


def _entity_id(value: object, issues: list[ValidationIssue], path: str) -> str | None:
    if value in (None, ""):
        return None
    if (
        not isinstance(value, str)
        or "." not in value
        or value.startswith(".")
        or value.endswith(".")
    ):
        _issue(issues, path, "invalid_entity_id", "A Home Assistant entity ID is required.")
        return None
    return value


def _time_value(value: object, issues: list[ValidationIssue], path: str) -> str | None:
    if not isinstance(value, str):
        _issue(issues, path, "invalid_time", "A local time in HH:MM format is required.")
        return None
    try:
        parsed = time.fromisoformat(value)
    except ValueError:
        _issue(issues, path, "invalid_time", "A local time in HH:MM format is required.")
        return None
    if parsed.tzinfo is not None:
        _issue(
            issues,
            path,
            "invalid_time",
            "Schedule times must be local wall-clock times without a timezone.",
        )
        return None
    return parsed.strftime("%H:%M")


def _validate_windows(
    windows: object, issues: list[ValidationIssue], path: str
) -> list[dict[str, Any]]:
    """Validate recurring local schedules while retaining display metadata."""

    if not isinstance(windows, list):
        _issue(issues, path, "invalid_list", "A list of schedule windows is required.")
        return []
    normalized: list[dict[str, Any]] = []
    for index, window in enumerate(windows):
        window_path = f"{path}[{index}]"
        if not isinstance(window, Mapping):
            _issue(issues, window_path, "invalid_window", "Each schedule window must be an object.")
            continue
        start = _time_value(window.get("start"), issues, f"{window_path}.start")
        end = _time_value(window.get("end"), issues, f"{window_path}.end")
        days = window.get("days", list(range(7)))
        if not isinstance(days, list) or any(
            isinstance(day, bool) or not isinstance(day, int) or day not in range(7) for day in days
        ):
            _issue(
                issues,
                f"{window_path}.days",
                "invalid_days",
                "Days must be weekday indexes from 0 to 6.",
            )
            days = []
        if start is not None and end is not None and start == end:
            _issue(issues, window_path, "zero_length_window", "Start and end cannot be the same.")
        name = window.get("name", f"window_{index + 1}")
        if not isinstance(name, str) or not name.strip() or len(name.strip()) > 80:
            _issue(
                issues,
                f"{window_path}.name",
                "invalid_name",
                "Window name must be 1 to 80 characters.",
            )
            name = f"window_{index + 1}"
        mandatory = window.get("mandatory", window.get("kind") == "mandatory")
        if not isinstance(mandatory, bool):
            _issue(
                issues,
                f"{window_path}.mandatory",
                "invalid_boolean",
                "Mandatory must be a boolean.",
            )
            mandatory = False
        normalized.append(
            {
                "name": name.strip(),
                "start": start,
                "end": end,
                "days": sorted(set(days)),
                "kind": "mandatory" if mandatory else str(window.get("kind", "schedule")),
                "mandatory": mandatory,
            }
        )
    return normalized


def _validate_action(
    value: object, issues: list[ValidationIssue], path: str
) -> dict[str, Any] | None:
    """Validate explicitly configured HA actions without resolving or calling them."""

    if value in (None, {}):
        return None
    if not isinstance(value, Mapping):
        _issue(issues, path, "invalid_action", "An action must be an object.")
        return None
    action = deepcopy(dict(value))
    service = action.get("service")
    if (
        not isinstance(service, str)
        or service.count(".") != 1
        or any(not part for part in service.split("."))
    ):
        _issue(
            issues,
            f"{path}.service",
            "invalid_service",
            "Use a Home Assistant domain.service action.",
        )
    if "data" in action and not isinstance(action["data"], Mapping):
        _issue(issues, f"{path}.data", "invalid_action_data", "Action data must be an object.")
    if "target" in action and not isinstance(action["target"], Mapping):
        _issue(
            issues, f"{path}.target", "invalid_action_target", "Action target must be an object."
        )
    return action


def _validate_actuator(config: dict[str, Any], issues: list[ValidationIssue]) -> None:
    actuator = _mapping(config.get("actuator"), issues, "actuator")
    config["actuator"] = actuator
    adapter_type = actuator.get("adapter_type")
    if adapter_type not in (None, "") and adapter_type not in ADAPTER_TYPES:
        _issue(issues, "actuator.adapter_type", "invalid_adapter_type", "Unsupported adapter type.")
    for field in (
        "entity_id",
        "state_entity_id",
        "setpoint_entity_id",
        "power_entity_id",
        "energy_entity_id",
    ):
        _entity_id(actuator.get(field), issues, f"actuator.{field}")
    _validate_action(actuator.get("on_action"), issues, "actuator.on_action")
    _validate_action(actuator.get("off_action"), issues, "actuator.off_action")
    for field in (
        "minimum_setpoint",
        "maximum_setpoint",
        "setpoint_increment",
        "minimum_power_w",
        "maximum_power_w",
        "nominal_voltage",
    ):
        if field in actuator and actuator.get(field) is not None:
            _positive_number(
                actuator.get(field),
                issues,
                f"actuator.{field}",
                allow_zero=field == "minimum_setpoint",
            )
    minimum = actuator.get("minimum_setpoint")
    maximum = actuator.get("maximum_setpoint")
    if isinstance(minimum, int | float) and isinstance(maximum, int | float) and minimum > maximum:
        _issue(
            issues,
            "actuator.minimum_setpoint",
            "minimum_above_maximum",
            "Minimum setpoint cannot exceed maximum setpoint.",
        )
    if adapter_type == "switch" and actuator.get("entity_id") not in (None, ""):
        entity_id = _entity_id(actuator.get("entity_id"), issues, "actuator.entity_id")
        if entity_id is not None and not entity_id.startswith("switch."):
            _issue(
                issues,
                "actuator.entity_id",
                "invalid_switch_entity",
                "Switch adapters require a switch entity.",
            )
    if adapter_type == "variable_number" and actuator.get("setpoint_entity_id") not in (None, ""):
        entity_id = _entity_id(
            actuator.get("setpoint_entity_id"), issues, "actuator.setpoint_entity_id"
        )
        if entity_id is not None and not entity_id.startswith("number."):
            _issue(
                issues,
                "actuator.setpoint_entity_id",
                "invalid_setpoint_entity",
                "Variable adapters require a number entity.",
            )


def _validate_feedback(config: dict[str, Any], issues: list[ValidationIssue]) -> None:
    feedback = _mapping(config.get("feedback"), issues, "feedback")
    config["feedback"] = feedback
    for key, value in feedback.items():
        if key.endswith("entity_id"):
            _entity_id(value, issues, f"feedback.{key}")
    for field in ("minimum_valid_power_w", "maximum_valid_power_w", "stale_seconds"):
        if field in feedback and feedback.get(field) is not None:
            _positive_number(
                feedback.get(field),
                issues,
                f"feedback.{field}",
                allow_zero=field == "minimum_valid_power_w",
            )


def _actuator_target_values(value: object, selector: str) -> set[str]:
    """Return normalized explicit action targets without resolving HA state."""

    if isinstance(value, str):
        return {f"{selector}:{value}"}
    if isinstance(value, list):
        return {f"{selector}:{item}" for item in value if isinstance(item, str)}
    return set()


def _action_binding_keys(action: object) -> set[str]:
    """Identify an action's explicit target, or its exact unscoped definition."""

    if not isinstance(action, Mapping):
        return set()
    bindings: set[str] = set()
    for section_name in ("target", "data"):
        section = action.get(section_name)
        if not isinstance(section, Mapping):
            continue
        for selector in ("entity_id", "device_id", "area_id", "label_id"):
            bindings.update(_actuator_target_values(section.get(selector), selector))
    if bindings:
        return bindings
    # Some valid HA actions intentionally have no declarative target.  We
    # cannot resolve their internals safely, but an identical action definition
    # must still belong to only one controlled load.
    try:
        serialized = json.dumps(
            {
                "service": action.get("service"),
                "target": action.get("target"),
                "data": action.get("data"),
            },
            default=str,
            separators=(",", ":"),
            sort_keys=True,
        )
    except (TypeError, ValueError):
        return set()
    return {f"action:{serialized}"}


def actuator_binding_keys(load_config: Mapping[str, Any]) -> frozenset[str]:
    """Return controllable HA targets declared by one normalized load config.

    Feedback sensors are intentionally excluded: several loads may observe a
    shared meter, while no two loads may own the same actuator.  This function
    remains pure so config flows, WebSocket mutations, and previews make the
    same safety decision before a config-subentry is written.
    """

    actuator = load_config.get("actuator")
    if not isinstance(actuator, Mapping):
        return frozenset()
    adapter_type = actuator.get("adapter_type")
    bindings: set[str] = set()
    if adapter_type == "switch":
        bindings.update(_actuator_target_values(actuator.get("entity_id"), "entity_id"))
    elif adapter_type == "variable_number":
        bindings.update(_actuator_target_values(actuator.get("setpoint_entity_id"), "entity_id"))
        bindings.update(_action_binding_keys(actuator.get("on_action")))
        bindings.update(_action_binding_keys(actuator.get("off_action")))
    elif adapter_type == "action_pair":
        bindings.update(_action_binding_keys(actuator.get("on_action")))
        bindings.update(_action_binding_keys(actuator.get("off_action")))
    return frozenset(bindings)


def duplicate_actuator_binding_load_ids(
    load_configs: Iterable[Mapping[str, Any]],
) -> frozenset[str]:
    """Return the load IDs involved in a cross-load actuator conflict."""

    owners: dict[str, str] = {}
    conflicts: set[str] = set()
    for index, config in enumerate(load_configs):
        load_id = config.get("load_id")
        owner = load_id if isinstance(load_id, str) else f"draft-{index}"
        for binding in actuator_binding_keys(config):
            existing_owner = owners.get(binding)
            if existing_owner is None:
                owners[binding] = owner
                continue
            if existing_owner != owner:
                conflicts.update((existing_owner, owner))
    return frozenset(conflicts)


def validate_unique_actuator_bindings(load_configs: Iterable[Mapping[str, Any]]) -> None:
    """Reject site configs where more than one load claims an actuator target."""

    if duplicate_actuator_binding_load_ids(load_configs):
        raise ConfigurationValidationError(
            [
                ValidationIssue(
                    "actuator",
                    "duplicate_actuator_binding",
                    "This actuator target is already assigned to another load.",
                )
            ]
        )


def _validate_requirements(config: dict[str, Any], issues: list[ValidationIssue]) -> None:
    requirements = _mapping(config.get("requirements"), issues, "requirements")
    config["requirements"] = requirements
    combination = requirements.get("combination", requirements.get("mode", "none"))
    if combination not in REQUIREMENT_COMBINATIONS:
        _issue(
            issues,
            "requirements.combination",
            "invalid_combination",
            "Use none, all_of, any_of, or primary_with_guard.",
        )
    requirements["combination"] = combination
    for field in (
        "minimum_confirmed_runtime_s",
        "minimum_runtime_s",
        "target_runtime_s",
        "minimum_energy_wh",
        "target_energy_wh",
        "minimum_energy_kwh",
        "target_temperature_c",
        "target_soc_pct",
        "fallback_runtime_s",
        "safety_margin_seconds",
    ):
        if field in requirements and requirements.get(field) is not None:
            minimum = 0 if field in {"target_temperature_c"} else 0
            _finite_number(
                requirements.get(field), issues, f"requirements.{field}", minimum=minimum
            )
    for field in ("target_soc_pct",):
        if field in requirements and requirements.get(field) is not None:
            _finite_number(
                requirements.get(field), issues, f"requirements.{field}", minimum=0, maximum=100
            )
    deadline = requirements.get("deadline_at", requirements.get("deadline"))
    if deadline not in (None, ""):
        if not isinstance(deadline, str):
            _issue(
                issues,
                "requirements.deadline_at",
                "invalid_deadline",
                "Deadline must be an ISO-8601 UTC instant.",
            )
        else:
            try:
                parsed = datetime.fromisoformat(deadline)
            except ValueError:
                _issue(
                    issues,
                    "requirements.deadline_at",
                    "invalid_deadline",
                    "Deadline must be an ISO-8601 UTC instant.",
                )
            else:
                if parsed.tzinfo is None or parsed.utcoffset() is None:
                    _issue(
                        issues,
                        "requirements.deadline_at",
                        "timezone_required",
                        "Deadline must include a timezone.",
                    )
                else:
                    requirements["deadline_at"] = parsed.astimezone(UTC).isoformat()


def _validate_safety(config: dict[str, Any], issues: list[ValidationIssue]) -> None:
    safety = _mapping(config.get("safety"), issues, "safety")
    config["safety"] = safety
    for field in (
        "minimum_on_seconds",
        "minimum_off_seconds",
        "min_on_seconds",
        "min_off_seconds",
        "max_starts_per_hour",
        "max_starts_per_day",
        "maximum_runtime_s",
        "adjustment_interval_seconds",
        "ramp_interval_seconds",
        "ramp_step_a",
    ):
        if field in safety and safety.get(field) is not None:
            _positive_number(
                safety.get(field),
                issues,
                f"safety.{field}",
                allow_zero=field
                in {
                    "minimum_on_seconds",
                    "minimum_off_seconds",
                    "min_on_seconds",
                    "min_off_seconds",
                },
            )


def _validate_solar(config: dict[str, Any], issues: list[ValidationIssue]) -> None:
    solar = _mapping(config.get("solar"), issues, "solar")
    config["solar"] = solar
    for field in (
        "start_threshold_w",
        "stop_threshold_w",
        "start_qualification_seconds",
        "stop_qualification_seconds",
        "minimum_on_seconds",
        "minimum_off_seconds",
        "max_starts_per_hour",
        "increase_qualification_seconds",
        "decrease_qualification_seconds",
        "adjustment_interval_seconds",
        "step_w",
    ):
        if field in solar and solar.get(field) is not None:
            _positive_number(
                solar.get(field), issues, f"solar.{field}", allow_zero=field.endswith("seconds")
            )
    start = solar.get("start_threshold_w")
    stop = solar.get("stop_threshold_w")
    if isinstance(start, int | float) and isinstance(stop, int | float) and stop > start:
        _issue(
            issues,
            "solar.stop_threshold_w",
            "stop_above_start",
            "Stop threshold cannot exceed start threshold.",
        )


def _validate_boost_presets(config: dict[str, Any], issues: list[ValidationIssue]) -> None:
    presets = config.get("boost_presets")
    if not isinstance(presets, list):
        _issue(issues, "boost_presets", "invalid_boost_presets", "Boost presets must be a list.")
        config["boost_presets"] = []
        return
    normalized: list[dict[str, Any]] = []
    for index, preset in enumerate(presets):
        path = f"boost_presets[{index}]"
        if not isinstance(preset, Mapping):
            _issue(issues, path, "invalid_preset", "Each Boost preset must be an object.")
            continue
        value = deepcopy(dict(preset))
        name = value.get("name", f"Boost {index + 1}")
        if not isinstance(name, str) or not name.strip() or len(name.strip()) > 80:
            _issue(
                issues, f"{path}.name", "invalid_name", "Preset name must be 1 to 80 characters."
            )
        value["name"] = name.strip() if isinstance(name, str) else f"Boost {index + 1}"
        desired = value.get("desired_state", "on")
        if desired not in {"on", "off"}:
            _issue(
                issues, f"{path}.desired_state", "invalid_state", "Preset state must be on or off."
            )
        duration = value.get("duration_seconds")
        if duration is not None:
            _positive_number(duration, issues, f"{path}.duration_seconds")
        if value.get("indefinite", False) and duration is not None:
            _issue(
                issues,
                path,
                "ambiguous_expiry",
                "An indefinite preset cannot also have a duration.",
            )
        normalized.append(value)
    config["boost_presets"] = normalized


def _validate_learning(config: dict[str, Any], issues: list[ValidationIssue]) -> None:
    learning = _mapping(config.get("learning"), issues, "learning")
    config["learning"] = learning
    for field in ("enabled", "frozen"):
        if field in learning and not isinstance(learning[field], bool):
            _issue(
                issues,
                f"learning.{field}",
                "invalid_boolean",
                "This learning flag must be a boolean.",
            )
    for field in (
        "minimum_power_w",
        "maximum_power_w",
        "minimum_samples",
        "outlier_ratio",
        "ewma_alpha",
        "max_sample_age_seconds",
    ):
        if field in learning and learning.get(field) is not None:
            _positive_number(learning.get(field), issues, f"learning.{field}")
    minimum = learning.get("minimum_power_w")
    maximum = learning.get("maximum_power_w")
    if isinstance(minimum, int | float) and isinstance(maximum, int | float) and minimum > maximum:
        _issue(
            issues,
            "learning.minimum_power_w",
            "minimum_above_maximum",
            "Learning lower bound cannot exceed upper bound.",
        )


def _validate_site_tariffs(config: dict[str, Any], issues: list[ValidationIssue]) -> None:
    mode = config.get("tariff_mode")
    if mode not in {"fixed", "tou", "entity", "future_entity", "hybrid"}:
        _issue(issues, "tariff_mode", "invalid_tariff_mode", "Unsupported tariff mode.")
    for field in (
        "fixed_import_price_unit",
        "current_price_unit",
        "feed_in_tariff_unit",
        "feed_in_entity_unit",
    ):
        if config.get(field) not in PRICE_UNITS:
            _issue(issues, field, "invalid_price_unit", "Unsupported price unit.")
    for field in ("fixed_import_price", "feed_in_tariff", "battery_penalty_per_kwh"):
        if config.get(field) is not None:
            _finite_number(config.get(field), issues, field)
    for field in ("current_price_entity_id", "future_price_entity_id", "feed_in_entity_id"):
        _entity_id(config.get(field), issues, field)
    periods = config.get("tou_periods")
    if not isinstance(periods, list):
        _issue(issues, "tou_periods", "invalid_list", "TOU periods must be a list.")
        config["tou_periods"] = []
        return
    normalized: list[dict[str, Any]] = []
    for index, period in enumerate(periods):
        path = f"tou_periods[{index}]"
        if not isinstance(period, Mapping):
            _issue(issues, path, "invalid_period", "Each TOU period must be an object.")
            continue
        value = deepcopy(dict(period))
        value["start"] = _time_value(value.get("start"), issues, f"{path}.start")
        value["end"] = _time_value(value.get("end"), issues, f"{path}.end")
        days = value.get("days", list(range(7)))
        if not isinstance(days, list) or any(
            isinstance(day, bool) or not isinstance(day, int) or day not in range(7) for day in days
        ):
            _issue(
                issues, f"{path}.days", "invalid_days", "Days must be weekday indexes from 0 to 6."
            )
            days = []
        value["days"] = sorted(set(days))
        _finite_number(value.get("import_price"), issues, f"{path}.import_price", allow_none=False)
        if value.get("export_price") is not None:
            _finite_number(value.get("export_price"), issues, f"{path}.export_price")
        unit = value.get("unit", config["fixed_import_price_unit"])
        if unit not in PRICE_UNITS:
            _issue(issues, f"{path}.unit", "invalid_price_unit", "Unsupported price unit.")
        value["unit"] = unit
        normalized.append(value)
    config["tou_periods"] = normalized


def validate_site_config(raw: Mapping[str, Any], *, require_name: bool = True) -> dict[str, Any]:
    """Validate and normalize site configuration without touching HA state."""

    if not isinstance(raw, Mapping):
        raise ConfigurationValidationError(
            [ValidationIssue("", "invalid_object", "Site configuration must be an object.")]
        )
    config = deepcopy(SITE_DEFAULTS)
    config.update(deepcopy(dict(raw)))
    issues: list[ValidationIssue] = []

    name = config.get("site_name")
    if not isinstance(name, str) or not name.strip() or len(name.strip()) > 80:
        if require_name:
            _issue(issues, "site_name", "invalid_name", "Site name must be 1 to 80 characters.")
    else:
        config["site_name"] = name.strip()

    if config.get("grid_sign_convention") not in GRID_SIGN_CONVENTIONS:
        _issue(
            issues,
            "grid_sign_convention",
            "invalid_sign_convention",
            "Unsupported grid sign convention.",
        )
    boundary = _time_value(
        config.get("operational_day_boundary"), issues, "operational_day_boundary"
    )
    if boundary is not None:
        config["operational_day_boundary"] = boundary
    horizon = _positive_number(
        config.get("planning_horizon_hours"), issues, "planning_horizon_hours"
    )
    if horizon is not None:
        config["planning_horizon_hours"] = int(horizon)
        if horizon < 24:
            _issue(
                issues,
                "planning_horizon_hours",
                "horizon_too_short",
                "Planning horizon must be at least 24 hours.",
            )
    resolution = _positive_number(
        config.get("planning_resolution_seconds"), issues, "planning_resolution_seconds"
    )
    if resolution is not None:
        config["planning_resolution_seconds"] = int(resolution)
        if int(resolution) % 60:
            _issue(
                issues,
                "planning_resolution_seconds",
                "invalid_resolution",
                "Planning resolution must be a whole number of minutes.",
            )
        if int(resolution) != DEFAULT_PLANNING_RESOLUTION_SECONDS:
            _issue(
                issues,
                "planning_resolution_seconds",
                "unsupported_resolution",
                "V1 planning uses five-minute (300 second) slots.",
            )

    for field in (
        "safety_margin_seconds",
        "soft_import_limit_w",
        "hard_import_limit_w",
        "max_controlled_power_w",
        "max_simultaneous_binary_loads",
        "start_stagger_seconds",
        "sensor_stale_seconds",
        "price_stale_seconds",
        "decision_journal_limit",
        "history_retention_days",
    ):
        allow_zero = field in {"start_stagger_seconds"}
        value = _positive_number(config.get(field), issues, field, allow_zero=allow_zero)
        if value is not None:
            config[field] = (
                int(value)
                if field
                in {
                    "max_simultaneous_binary_loads",
                    "decision_journal_limit",
                    "history_retention_days",
                }
                else value
            )

    hard_limit = config.get("hard_import_limit_w")
    soft_limit = config.get("soft_import_limit_w")
    controlled_limit = config.get("max_controlled_power_w")
    if (
        isinstance(hard_limit, int | float)
        and isinstance(soft_limit, int | float)
        and soft_limit > hard_limit
    ):
        _issue(
            issues,
            "soft_import_limit_w",
            "soft_above_hard",
            "Soft import limit cannot exceed hard import limit.",
        )
    if (
        isinstance(hard_limit, int | float)
        and isinstance(controlled_limit, int | float)
        and controlled_limit > hard_limit
    ):
        _issue(
            issues,
            "max_controlled_power_w",
            "controlled_above_hard",
            "Controlled-load limit cannot exceed hard import limit.",
        )

    for field in (
        "grid_power_entity_id",
        "grid_import_entity_id",
        "grid_export_entity_id",
        "solar_power_entity_id",
    ):
        _entity_id(config.get(field), issues, field)
    if config.get("grid_power_entity_id") and (
        config.get("grid_import_entity_id") or config.get("grid_export_entity_id")
    ):
        _issue(
            issues,
            "grid_power_entity_id",
            "ambiguous_grid_inputs",
            "Choose either signed net grid power or separate import/export sensors.",
        )
    phase_entities = _mapping(
        config.get("phase_power_entity_ids"), issues, "phase_power_entity_ids"
    )
    config["phase_power_entity_ids"] = phase_entities
    for phase, entity_id in phase_entities.items():
        if phase not in {"a", "b", "c"}:
            _issue(
                issues,
                f"phase_power_entity_ids.{phase}",
                "invalid_phase",
                "Phase must be a, b, or c.",
            )
        _entity_id(entity_id, issues, f"phase_power_entity_ids.{phase}")
    phase_limits = _mapping(config.get("phase_limits_w"), issues, "phase_limits_w")
    config["phase_limits_w"] = phase_limits
    for phase, limit in phase_limits.items():
        if phase not in {"a", "b", "c"}:
            _issue(issues, f"phase_limits_w.{phase}", "invalid_phase", "Phase must be a, b, or c.")
        _positive_number(limit, issues, f"phase_limits_w.{phase}")

    config["free_energy_periods"] = _validate_windows(
        config.get("free_energy_periods"), issues, "free_energy_periods"
    )
    _validate_site_tariffs(config, issues)
    battery = _mapping(config.get("battery"), issues, "battery")
    config["battery"] = battery
    for key, value in battery.items():
        if key.endswith("entity_id"):
            _entity_id(value, issues, f"battery.{key}")
    for field in ("reserve_soc_pct", "capacity_kwh", "discretionary_discharge_limit_w"):
        if field in battery and battery.get(field) is not None:
            maximum = 100 if field == "reserve_soc_pct" else None
            _finite_number(
                battery.get(field), issues, f"battery.{field}", minimum=0, maximum=maximum
            )
    if "prevent_discretionary_discharge" in battery and not isinstance(
        battery["prevent_discretionary_discharge"], bool
    ):
        _issue(
            issues,
            "battery.prevent_discretionary_discharge",
            "invalid_boolean",
            "Battery discharge prevention must be a boolean.",
        )
    sign = battery.get("power_sign_convention", "discharge_positive")
    if sign not in {"discharge_positive", "charge_positive"}:
        _issue(
            issues,
            "battery.power_sign_convention",
            "invalid_sign_convention",
            "Battery power sign convention must be discharge_positive or charge_positive.",
        )
    if not isinstance(config.get("manual_may_exceed_soft_limit"), bool):
        _issue(
            issues,
            "manual_may_exceed_soft_limit",
            "invalid_boolean",
            "Manual soft-limit policy must be a boolean.",
        )
    if config.get("default_optimisation_mode") not in OPTIMISATION_MODES:
        _issue(
            issues,
            "default_optimisation_mode",
            "invalid_optimisation_mode",
            "Unsupported default optimisation mode.",
        )
    if not isinstance(config.get("notification_actions"), list):
        _issue(
            issues, "notification_actions", "invalid_list", "Notification actions must be a list."
        )
    if not isinstance(config.get("forecast_entities"), Mapping):
        _issue(
            issues, "forecast_entities", "invalid_object", "Forecast entities must be an object."
        )
    if not isinstance(config.get("dashboard_preferences"), Mapping):
        _issue(
            issues,
            "dashboard_preferences",
            "invalid_object",
            "Dashboard preferences must be an object.",
        )
    if not isinstance(config.get("feature_flags"), Mapping):
        _issue(issues, "feature_flags", "invalid_object", "Feature flags must be an object.")
    if (
        not isinstance(config.get("config_revision"), int)
        or isinstance(config.get("config_revision"), bool)
        or config["config_revision"] < 0
    ):
        _issue(
            issues,
            "config_revision",
            "invalid_revision",
            "Configuration revision must be a non-negative integer.",
        )
    config["schema_version"] = CONFIG_SCHEMA_VERSION

    if issues:
        raise ConfigurationValidationError(issues)
    return config


def validate_load_config(raw: Mapping[str, Any], *, create_id: bool = False) -> dict[str, Any]:
    """Validate and normalize one load config-subentry without touching HA state."""

    if not isinstance(raw, Mapping):
        raise ConfigurationValidationError(
            [ValidationIssue("", "invalid_object", "Load configuration must be an object.")]
        )
    config = deepcopy(LOAD_DEFAULTS)
    config.update(deepcopy(dict(raw)))
    issues: list[ValidationIssue] = []

    load_id = config.get("load_id")
    if load_id is None and create_id:
        config["load_id"] = str(uuid4())
    elif not isinstance(load_id, str):
        _issue(issues, "load_id", "missing_load_id", "A stable load ID is required.")
    else:
        try:
            UUID(load_id)
        except (ValueError, AttributeError, TypeError):
            _issue(issues, "load_id", "invalid_load_id", "Load ID must be a UUID.")

    display_name = config.get("display_name")
    if (
        not isinstance(display_name, str)
        or not display_name.strip()
        or len(display_name.strip()) > 80
    ):
        _issue(issues, "display_name", "invalid_name", "Display name must be 1 to 80 characters.")
    else:
        config["display_name"] = display_name.strip()
    if config.get("load_type") not in LOAD_TYPES:
        _issue(issues, "load_type", "invalid_load_type", "Unsupported load type.")
    if config.get("optimisation_mode") not in OPTIMISATION_MODES:
        _issue(
            issues,
            "optimisation_mode",
            "invalid_optimisation_mode",
            "Unsupported optimisation mode.",
        )
    if config.get("phase_assignment") not in PHASE_ASSIGNMENTS:
        _issue(issues, "phase_assignment", "invalid_phase", "Unsupported phase assignment.")
    for field in ("enabled", "automatic_control"):
        if not isinstance(config.get(field), bool):
            _issue(
                issues,
                field,
                "invalid_boolean",
                f"{field.replace('_', ' ').capitalize()} must be a boolean.",
            )
    priority = config.get("priority")
    if isinstance(priority, bool) or not isinstance(priority, int) or not 0 <= priority <= 100:
        _issue(issues, "priority", "invalid_priority", "Priority must be an integer from 0 to 100.")
    expected_power = _positive_number(
        config.get("expected_power_w"), issues, "expected_power_w", allow_zero=True
    )
    if expected_power is not None:
        config["expected_power_w"] = expected_power
    phase_count = config.get("phase_count")
    if (
        isinstance(phase_count, bool)
        or not isinstance(phase_count, int)
        or phase_count not in {1, 2, 3}
    ):
        _issue(issues, "phase_count", "invalid_phase_count", "Phase count must be 1, 2, or 3.")
    if config.get("phase_assignment") == "three_phase" and phase_count != 3:
        _issue(
            issues,
            "phase_count",
            "three_phase_requires_three",
            "Three-phase loads require phase count 3.",
        )
    per_phase = config.get("estimated_power_per_phase_w")
    if per_phase is not None:
        _positive_number(per_phase, issues, "estimated_power_per_phase_w", allow_zero=True)
    efficiency = _finite_number(
        config.get("efficiency"), issues, "efficiency", minimum=0, maximum=1, allow_none=False
    )
    if efficiency is not None:
        config["efficiency"] = efficiency

    _validate_actuator(config, issues)
    _validate_feedback(config, issues)
    _validate_requirements(config, issues)
    config["schedule_windows"] = _validate_windows(
        config.get("schedule_windows"), issues, "schedule_windows"
    )
    _validate_safety(config, issues)
    _validate_solar(config, issues)
    _validate_boost_presets(config, issues)
    _validate_learning(config, issues)
    notifications = config.get("notifications")
    if not isinstance(notifications, Mapping):
        _issue(issues, "notifications", "invalid_notifications", "Notifications must be an object.")
    if (
        not isinstance(config.get("config_revision"), int)
        or isinstance(config.get("config_revision"), bool)
        or config["config_revision"] < 0
    ):
        _issue(
            issues,
            "config_revision",
            "invalid_revision",
            "Configuration revision must be a non-negative integer.",
        )
    config["schema_version"] = CONFIG_SCHEMA_VERSION

    if issues:
        raise ConfigurationValidationError(issues)
    return config


def configuration_schema() -> dict[str, Any]:
    """Return a stable, UI-friendly description of supported configuration.

    This is intentionally descriptive rather than a second executable schema;
    callers must always submit data to :func:`validate_site_config` or
    :func:`validate_load_config` before a write or preview.
    """

    return {
        "version": CONFIG_SCHEMA_VERSION,
        "site": {
            "required": ["site_name"],
            "fields": {
                "site_name": {"type": "string", "max_length": 80},
                "grid_sign_convention": {
                    "type": "select",
                    "options": sorted(GRID_SIGN_CONVENTIONS),
                },
                "grid_power_entity_id": {"type": "entity", "domain": "sensor"},
                "grid_import_entity_id": {"type": "entity", "domain": "sensor"},
                "grid_export_entity_id": {"type": "entity", "domain": "sensor"},
                "hard_import_limit_w": {"type": "number", "minimum_exclusive": 0},
                "soft_import_limit_w": {"type": "number", "minimum_exclusive": 0},
                "max_controlled_power_w": {"type": "number", "minimum_exclusive": 0},
                "planning_horizon_hours": {"type": "number", "minimum": 24, "default": 24},
                "planning_resolution_seconds": {"type": "number", "const": 300},
                "tariff_mode": {
                    "type": "select",
                    "options": ["fixed", "tou", "entity", "future_entity", "hybrid"],
                },
                "fixed_import_price_unit": {"type": "select", "options": sorted(PRICE_UNITS)},
                "free_energy_periods": {"type": "schedule_windows"},
            },
        },
        "load": {
            "required": ["display_name", "load_type"],
            "fields": {
                "display_name": {"type": "string", "max_length": 80},
                "load_type": {"type": "select", "options": sorted(LOAD_TYPES)},
                "enabled": {"type": "boolean"},
                "automatic_control": {"type": "boolean"},
                "optimisation_mode": {"type": "select", "options": sorted(OPTIMISATION_MODES)},
                "phase_assignment": {"type": "select", "options": sorted(PHASE_ASSIGNMENTS)},
                "priority": {"type": "number", "minimum": 0, "maximum": 100},
                "expected_power_w": {"type": "number", "minimum": 0},
                "actuator": {"type": "adapter", "options": sorted(ADAPTER_TYPES)},
                "requirements": {
                    "type": "requirements",
                    "combinations": sorted(REQUIREMENT_COMBINATIONS),
                },
                "schedule_windows": {"type": "schedule_windows"},
                "boost_presets": {"type": "boost_presets"},
            },
        },
    }


def serialize_issues(error: ConfigurationValidationError) -> list[dict[str, str]]:
    """Serialize issues without leaking implementation-specific exception details."""

    return [
        {"path": issue.path, "code": issue.code, "message": issue.message} for issue in error.issues
    ]
