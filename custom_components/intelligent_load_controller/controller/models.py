"""Immutable, Home-Assistant-independent domain models for the controller.

The controller works exclusively with normalised values:

* power is watts;
* energy is watt-hours;
* durations are seconds;
* instants are timezone-aware UTC ``datetime`` values; and
* prices are ``Decimal`` local-currency per kWh.

Keeping these objects free of Home Assistant types is deliberate.  The HA
boundary is responsible for entity conversion, persistence serialisation, and
actuation; policy code can consequently be exercised in a deterministic
simulator without importing Home Assistant.
"""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from datetime import UTC, datetime, time
from decimal import ROUND_CEILING, Decimal, InvalidOperation
from enum import Enum
from math import isfinite
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

type Money = Decimal
type Metadata = tuple[tuple[str, str], ...]
type PhaseValues = tuple[tuple[str, float], ...]
type PhaseValuesInput = Mapping[str, float] | Iterable[tuple[str, float]]


class LoadKind(str, Enum):
    """The V1 load classes supported by the policy layer."""

    HOT_WATER = "hot_water"
    GENERIC_BINARY = "generic_binary"
    EV_BINARY = "ev_binary"
    EV_VARIABLE = "ev_variable"
    BATTERY_CHARGER = "battery_charger"
    BATTERY_SWITCH = "battery_switch"


class CompletionMode(str, Enum):
    """A signal that can establish that a load objective is complete."""

    RUNTIME = "runtime"
    ENERGY = "energy"
    TEMPERATURE = "temperature"
    STATE_OF_CHARGE = "state_of_charge"
    DEADLINE = "deadline"
    COMPOSITE = "composite"


class LoadState(str, Enum):
    """High-level controller state, intended for stable UI/API presentation."""

    IDLE = "idle"
    WAITING = "waiting"
    PLANNED = "planned"
    RUNNING = "running"
    HOLDING = "holding"
    COMPLETE = "complete"
    BLOCKED = "blocked"
    OVERRIDDEN = "overridden"
    FAULT = "fault"
    OBSERVING = "observing"


class CommandSource(str, Enum):
    """Who requested a command; only automatic commands are gateable by mode."""

    AUTOMATIC = "automatic"
    MANUAL = "manual"
    SAFETY = "safety"
    RECOVERY = "recovery"


class CommandAction(str, Enum):
    START = "start"
    STOP = "stop"
    SET_POWER = "set_power"


class OverrideMode(str, Enum):
    FORCE_ON = "force_on"
    FORCE_OFF = "force_off"
    RETURN_TO_AUTOMATIC = "return_to_automatic"


class EnergySource(str, Enum):
    GRID = "grid"
    SOLAR = "solar"
    BATTERY = "battery"
    UNKNOWN = "unknown"


class ReasonCode(str, Enum):
    """Stable, machine-readable decision reason codes.

    Text is intentionally not embedded in these codes.  The integration/UI can
    translate the code while tests, diagnostics and automations retain a stable
    contract.
    """

    PLAN_SELECTED = "plan_selected"
    PLAN_NOT_SELECTED = "plan_not_selected"
    AUTOMATIC_DISABLED = "automatic_disabled"
    STARTUP_OBSERVING = "startup_observing"
    MANUAL_OVERRIDE = "manual_override"
    OVERRIDE_EXPIRED = "override_expired"
    HARD_SITE_LIMIT = "hard_site_limit"
    SOFT_SITE_LIMIT = "soft_site_limit"
    CONTROLLED_SITE_LIMIT = "controlled_site_limit"
    PHASE_LIMIT = "phase_limit"
    EQUIPMENT_LIMIT = "equipment_limit"
    MAX_SIMULTANEOUS_BINARY_LOADS = "max_simultaneous_binary_loads"
    INPUT_MISSING = "input_missing"
    INPUT_STALE = "input_stale"
    SCHEDULE_INACTIVE = "schedule_inactive"
    OUTSIDE_WINDOW = "outside_window"
    DEADLINE_DUE = "deadline_due"
    DEADLINE_IMPOSSIBLE = "deadline_impossible"
    TARIFF_UNAVAILABLE = "tariff_unavailable"
    SOLAR_INSUFFICIENT = "solar_insufficient"
    SOLAR_QUALIFYING = "solar_qualifying"
    MINIMUM_ON_HOLD = "minimum_on_hold"
    MINIMUM_OFF_HOLD = "minimum_off_hold"
    START_STAGGER = "start_stagger"
    FAIRNESS_DEFERRED = "fairness_deferred"
    LOAD_COMPLETE = "load_complete"
    ACTUATOR_FEEDBACK_MISMATCH = "actuator_feedback_mismatch"
    SETPOINT_BOUNDED = "setpoint_bounded"
    PREVIEW = "preview"
    CONFIG_CONFLICT = "config_conflict"
    LEARNING_FROZEN = "learning_frozen"
    LEARNING_OUTLIER = "learning_outlier"


def as_utc(value: datetime, *, field_name: str = "datetime") -> datetime:
    """Return an aware instant in UTC, rejecting ambiguous naive input.

    Local schedule values are represented separately by :class:`ScheduleWindow`.
    Every model that represents an instant therefore has a single unambiguous
    representation and is safe to persist across timezone/DST changes.
    """

    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError(f"{field_name} must be timezone-aware")
    return value.astimezone(UTC)


def as_decimal(value: Decimal | int | float | str, *, field_name: str = "value") -> Decimal:
    """Convert a public numeric input without inheriting binary float noise."""

    try:
        result = value if isinstance(value, Decimal) else Decimal(str(value))
    except (InvalidOperation, ValueError) as err:
        raise ValueError(f"{field_name} must be a decimal number") from err
    if not result.is_finite():
        raise ValueError(f"{field_name} must be finite")
    return result


def freeze_metadata(value: Mapping[str, object] | Iterable[tuple[str, object]] = ()) -> Metadata:
    """Return sorted string pairs suitable for an immutable event payload."""

    pairs = value.items() if isinstance(value, Mapping) else value
    return tuple(sorted((str(key), str(item)) for key, item in pairs))


def freeze_phase_values(
    value: PhaseValuesInput = (),
    *,
    field_name: str = "phase values",
    allow_negative: bool = False,
) -> PhaseValues:
    """Validate and freeze a phase-to-watts mapping.

    Site limits are non-negative, while observed phase power may be signed when
    a phase is exporting.  The caller chooses the latter explicitly.
    """

    pairs = value.items() if isinstance(value, Mapping) else value
    frozen: list[tuple[str, float]] = []
    seen: set[str] = set()
    for phase, watts in pairs:
        phase_text = str(phase)
        if not phase_text:
            raise ValueError(f"{field_name} contains an empty phase name")
        if phase_text in seen:
            raise ValueError(f"{field_name} contains duplicate phase {phase_text!r}")
        checked = float(watts)
        if not isfinite(checked) or (checked < 0 and not allow_negative):
            qualifier = "finite" if allow_negative else "finite non-negative"
            raise ValueError(f"{field_name}[{phase_text}] must be a {qualifier} number")
        seen.add(phase_text)
        frozen.append((phase_text, checked))
    return tuple(sorted(frozen))


def _finite_non_negative(value: float | int, *, field_name: str) -> float:
    result = float(value)
    if not isfinite(result) or result < 0:
        raise ValueError(f"{field_name} must be a finite non-negative number")
    return result


@dataclass(frozen=True, slots=True)
class ScheduleWindow:
    """A recurring local-time window whose weekdays refer to its start day.

    ``end <= start`` denotes an overnight window.  Local-time/DST resolution is
    performed by :mod:`.schedule`, not at configuration construction time.
    """

    name: str
    weekdays: frozenset[int]
    start: time
    end: time
    mandatory: bool = False

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("schedule name must not be empty")
        weekdays = frozenset(int(day) for day in self.weekdays)
        if not weekdays or any(day < 0 or day > 6 for day in weekdays):
            raise ValueError("weekdays must contain ISO weekday indices from 0 to 6")
        if self.start.tzinfo is not None or self.end.tzinfo is not None:
            raise ValueError("schedule times must be timezone-naive local times")
        object.__setattr__(self, "weekdays", weekdays)

    @property
    def is_overnight(self) -> bool:
        return self.end <= self.start


@dataclass(frozen=True, slots=True)
class CompletionTarget:
    mode: CompletionMode
    target: float
    tolerance: float = 0.0

    def __post_init__(self) -> None:
        _finite_non_negative(self.target, field_name="target")
        _finite_non_negative(self.tolerance, field_name="tolerance")


@dataclass(frozen=True, slots=True)
class SiteConfigV1:
    """Normalised, persisted site policy settings for one config entry."""

    site_id: str
    timezone: str
    currency: str
    hard_import_limit_w: float
    soft_import_limit_w: float | None = None
    controlled_import_limit_w: float | None = None
    phase_hard_limits_w: PhaseValuesInput = ()
    start_stagger_s: float = 0.0
    schema_version: int = 1
    revision: int = 1
    max_simultaneous_binary_loads: int | None = None

    def __post_init__(self) -> None:
        site_id = self.site_id.strip()
        timezone = self.timezone.strip()
        currency = self.currency.strip().upper()
        if not site_id:
            raise ValueError("site_id must not be empty")
        if not timezone:
            raise ValueError("timezone must not be empty")
        try:
            ZoneInfo(timezone)
        except ZoneInfoNotFoundError as err:
            raise ValueError(f"timezone must be a valid IANA timezone: {timezone!r}") from err
        if len(currency) != 3 or not currency.isalpha():
            raise ValueError("currency must be an ISO 4217 three-letter code")
        object.__setattr__(self, "site_id", site_id)
        object.__setattr__(self, "timezone", timezone)
        object.__setattr__(self, "currency", currency)
        hard = _finite_non_negative(self.hard_import_limit_w, field_name="hard_import_limit_w")
        if hard == 0:
            raise ValueError("hard_import_limit_w must be greater than zero")
        object.__setattr__(self, "hard_import_limit_w", hard)
        for attribute in ("soft_import_limit_w", "controlled_import_limit_w"):
            value = getattr(self, attribute)
            if value is not None:
                checked = _finite_non_negative(value, field_name=attribute)
                if checked > hard:
                    raise ValueError(f"{attribute} cannot exceed hard_import_limit_w")
                object.__setattr__(self, attribute, checked)
        object.__setattr__(
            self,
            "phase_hard_limits_w",
            freeze_phase_values(self.phase_hard_limits_w, field_name="phase_hard_limits_w"),
        )
        object.__setattr__(
            self,
            "start_stagger_s",
            _finite_non_negative(self.start_stagger_s, field_name="start_stagger_s"),
        )
        if self.max_simultaneous_binary_loads is not None:
            value = self.max_simultaneous_binary_loads
            if isinstance(value, bool) or not isinstance(value, int) or value < 1:
                raise ValueError("max_simultaneous_binary_loads must be an integer of at least one")
        if self.schema_version < 1 or self.revision < 1:
            raise ValueError("schema_version and revision must be positive")

    def phase_hard_limit_w(self, phase: str) -> float | None:
        return dict(self.phase_hard_limits_w).get(phase)


@dataclass(frozen=True, slots=True)
class LoadConfigV1:
    """Normalised settings for one load subentry."""

    load_id: str
    kind: LoadKind
    nominal_power_w: float
    priority: int = 0
    phase: str | None = None
    minimum_power_w: float | None = None
    maximum_power_w: float | None = None
    min_on_s: float = 0.0
    min_off_s: float = 0.0
    schedules: tuple[ScheduleWindow, ...] = ()
    completion_target: CompletionTarget | None = None
    schema_version: int = 1
    revision: int = 1

    def __post_init__(self) -> None:
        if not self.load_id.strip():
            raise ValueError("load_id must not be empty")
        nominal = _finite_non_negative(self.nominal_power_w, field_name="nominal_power_w")
        if nominal == 0:
            raise ValueError("nominal_power_w must be greater than zero")
        object.__setattr__(self, "nominal_power_w", nominal)
        minimum = self.minimum_power_w
        maximum = self.maximum_power_w
        if minimum is not None:
            minimum = _finite_non_negative(minimum, field_name="minimum_power_w")
            object.__setattr__(self, "minimum_power_w", minimum)
        if maximum is not None:
            maximum = _finite_non_negative(maximum, field_name="maximum_power_w")
            if maximum == 0:
                raise ValueError("maximum_power_w must be greater than zero")
            object.__setattr__(self, "maximum_power_w", maximum)
        operational_minimum = (
            minimum if minimum is not None else (0.0 if maximum is not None else nominal)
        )
        operational_maximum = maximum if maximum is not None else nominal
        if operational_minimum > operational_maximum:
            raise ValueError("minimum_power_w cannot exceed maximum_power_w")
        object.__setattr__(
            self, "min_on_s", _finite_non_negative(self.min_on_s, field_name="min_on_s")
        )
        object.__setattr__(
            self, "min_off_s", _finite_non_negative(self.min_off_s, field_name="min_off_s")
        )
        schedules = tuple(self.schedules)
        if not all(isinstance(schedule, ScheduleWindow) for schedule in schedules):
            raise ValueError("schedules must contain ScheduleWindow values")
        object.__setattr__(self, "schedules", schedules)
        if self.phase is not None and not self.phase.strip():
            raise ValueError("phase cannot be empty")
        if self.schema_version < 1 or self.revision < 1:
            raise ValueError("schema_version and revision must be positive")

    @property
    def is_variable_power(self) -> bool:
        return self.minimum_power_w is not None or self.maximum_power_w is not None

    @property
    def operational_minimum_power_w(self) -> float:
        if self.minimum_power_w is not None:
            return self.minimum_power_w
        return 0.0 if self.is_variable_power else self.nominal_power_w

    @property
    def operational_maximum_power_w(self) -> float:
        return self.maximum_power_w if self.maximum_power_w is not None else self.nominal_power_w


@dataclass(frozen=True, slots=True)
class SitePowerSnapshot:
    """A single observed site power point, with positive grid values importing."""

    at: datetime
    grid_import_w: float
    solar_generation_w: float | None = None
    battery_power_w: float | None = None
    phase_import_w: PhaseValuesInput = ()
    input_age_s: float = 0.0
    available: bool = True

    def __post_init__(self) -> None:
        object.__setattr__(self, "at", as_utc(self.at, field_name="at"))
        grid = float(self.grid_import_w)
        if not isfinite(grid):
            raise ValueError("grid_import_w must be finite")
        object.__setattr__(self, "grid_import_w", grid)
        for attribute in ("solar_generation_w", "battery_power_w"):
            value = getattr(self, attribute)
            if value is not None:
                checked = float(value)
                if not isfinite(checked):
                    raise ValueError(f"{attribute} must be finite")
                object.__setattr__(self, attribute, checked)
        object.__setattr__(
            self,
            "phase_import_w",
            freeze_phase_values(
                self.phase_import_w, field_name="phase_import_w", allow_negative=True
            ),
        )
        object.__setattr__(
            self, "input_age_s", _finite_non_negative(self.input_age_s, field_name="input_age_s")
        )

    def phase_import(self, phase: str) -> float | None:
        return dict(self.phase_import_w).get(phase)


@dataclass(frozen=True, slots=True)
class LoadSnapshot:
    """A single observed load state. Optional values mean the signal is absent."""

    load_id: str
    at: datetime
    running: bool | None
    observed_power_w: float | None = None
    energy_total_wh: float | None = None
    temperature_c: float | None = None
    state_of_charge_percent: float | None = None
    available: bool = True

    def __post_init__(self) -> None:
        if not self.load_id.strip():
            raise ValueError("load_id must not be empty")
        object.__setattr__(self, "at", as_utc(self.at, field_name="at"))
        for attribute in (
            "observed_power_w",
            "energy_total_wh",
            "temperature_c",
            "state_of_charge_percent",
        ):
            value = getattr(self, attribute)
            if value is not None:
                checked = float(value)
                if not isfinite(checked):
                    raise ValueError(f"{attribute} must be finite")
                object.__setattr__(self, attribute, checked)
        if (
            self.state_of_charge_percent is not None
            and not 0 <= self.state_of_charge_percent <= 100
        ):
            raise ValueError("state_of_charge_percent must be between 0 and 100")


@dataclass(frozen=True, slots=True)
class LoadRequest:
    """A policy request to schedule or arbitrate a load.

    For a binary load leave ``minimum_power_w`` and ``maximum_power_w`` unset;
    its requested power is indivisible.  Supplying either bound marks a request
    as variable-power and permits the arbitrator to throttle it within bounds.
    """

    load_id: str
    requested_power_w: float
    remaining_energy_wh: float | None = None
    remaining_runtime_s: float | None = None
    earliest_start_at: datetime | None = None
    deadline_at: datetime | None = None
    allowed_windows: tuple[ScheduleWindow, ...] = ()
    mandatory: bool = False
    priority: int = 0
    minimum_power_w: float | None = None
    maximum_power_w: float | None = None
    min_contiguous_s: float = 0.0
    current_power_w: float = 0.0
    phase: str | None = None
    control_source: CommandSource = CommandSource.AUTOMATIC
    fairness_debt: float = 0.0

    def __post_init__(self) -> None:
        if not self.load_id.strip():
            raise ValueError("load_id must not be empty")
        requested = _finite_non_negative(self.requested_power_w, field_name="requested_power_w")
        if requested == 0:
            raise ValueError("requested_power_w must be greater than zero")
        object.__setattr__(self, "requested_power_w", requested)
        for attribute in (
            "remaining_energy_wh",
            "remaining_runtime_s",
            "minimum_power_w",
            "maximum_power_w",
        ):
            value = getattr(self, attribute)
            if value is not None:
                object.__setattr__(
                    self, attribute, _finite_non_negative(value, field_name=attribute)
                )
        minimum = self.minimum_power_w
        maximum = self.maximum_power_w
        operational_minimum = (
            minimum if minimum is not None else (0.0 if maximum is not None else requested)
        )
        operational_maximum = maximum if maximum is not None else requested
        if operational_minimum > operational_maximum:
            raise ValueError("minimum_power_w cannot exceed maximum_power_w")
        if maximum is not None and maximum == 0:
            raise ValueError("maximum_power_w must be greater than zero")
        object.__setattr__(
            self,
            "min_contiguous_s",
            _finite_non_negative(self.min_contiguous_s, field_name="min_contiguous_s"),
        )
        object.__setattr__(
            self,
            "current_power_w",
            _finite_non_negative(self.current_power_w, field_name="current_power_w"),
        )
        if not isfinite(float(self.fairness_debt)):
            raise ValueError("fairness_debt must be finite")
        object.__setattr__(self, "fairness_debt", float(self.fairness_debt))
        earliest = self.earliest_start_at
        deadline = self.deadline_at
        if earliest is not None:
            earliest = as_utc(earliest, field_name="earliest_start_at")
            object.__setattr__(self, "earliest_start_at", earliest)
        if deadline is not None:
            deadline = as_utc(deadline, field_name="deadline_at")
            object.__setattr__(self, "deadline_at", deadline)
        if earliest is not None and deadline is not None and deadline < earliest:
            raise ValueError("deadline_at cannot precede earliest_start_at")
        windows = tuple(self.allowed_windows)
        if not all(isinstance(window, ScheduleWindow) for window in windows):
            raise ValueError("allowed_windows must contain ScheduleWindow values")
        object.__setattr__(self, "allowed_windows", windows)
        if self.phase is not None and not self.phase.strip():
            raise ValueError("phase cannot be empty")

    @property
    def is_variable_power(self) -> bool:
        return self.minimum_power_w is not None or self.maximum_power_w is not None

    @property
    def minimum_grant_w(self) -> float:
        if self.minimum_power_w is not None:
            return self.minimum_power_w
        return 0.0 if self.is_variable_power else self.requested_power_w

    @property
    def maximum_grant_w(self) -> float:
        return self.maximum_power_w if self.maximum_power_w is not None else self.requested_power_w

    def required_slot_count(self, slot_seconds: int) -> int:
        """Return the minimum full slots needed for the stated remaining work."""

        if slot_seconds <= 0:
            raise ValueError("slot_seconds must be positive")
        counts: list[int] = []
        if self.remaining_runtime_s is not None:
            counts.append(_ceiling_division(self.remaining_runtime_s, slot_seconds))
        if self.remaining_energy_wh is not None:
            energy_per_slot = (
                Decimal(str(self.requested_power_w)) * Decimal(slot_seconds) / Decimal(3600)
            )
            if energy_per_slot <= 0:
                raise ValueError("requested power must yield positive slot energy")
            counts.append(
                _ceiling_division(Decimal(str(self.remaining_energy_wh)), energy_per_slot)
            )
        return max(counts, default=0)


def _ceiling_division(numerator: Decimal | float, denominator: Decimal | float | int) -> int:
    if numerator <= 0:
        return 0
    # Convert through ``str`` so derived values such as 1000 / (1000 * 300 /
    # 3600) do not turn an exact 12 slots into 12.000000000000002 and round up.
    quotient = Decimal(str(numerator)) / Decimal(str(denominator))
    return int(quotient.to_integral_value(rounding=ROUND_CEILING))


@dataclass(frozen=True, slots=True)
class PlanInterval:
    load_id: str
    start_at: datetime
    end_at: datetime
    power_w: float
    expected_cost: Money = Decimal("0")
    reason: ReasonCode = ReasonCode.PLAN_SELECTED
    solar_allocated_w: float = 0.0

    def __post_init__(self) -> None:
        if not self.load_id.strip():
            raise ValueError("load_id must not be empty")
        start = as_utc(self.start_at, field_name="start_at")
        end = as_utc(self.end_at, field_name="end_at")
        if end <= start:
            raise ValueError("end_at must be after start_at")
        object.__setattr__(self, "start_at", start)
        object.__setattr__(self, "end_at", end)
        object.__setattr__(
            self, "power_w", _finite_non_negative(self.power_w, field_name="power_w")
        )
        object.__setattr__(
            self,
            "solar_allocated_w",
            _finite_non_negative(self.solar_allocated_w, field_name="solar_allocated_w"),
        )
        object.__setattr__(
            self, "expected_cost", as_decimal(self.expected_cost, field_name="expected_cost")
        )

    @property
    def duration_s(self) -> float:
        return (self.end_at - self.start_at).total_seconds()

    @property
    def expected_energy_wh(self) -> float:
        return self.power_w * self.duration_s / 3600


@dataclass(frozen=True, slots=True)
class SiteAllocation:
    """The site arbitrator's final decision for one requested load."""

    at: datetime
    load_id: str
    requested_w: float
    granted_w: float
    solar_allocated_w: float
    accepted: bool
    reasons: tuple[ReasonCode, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "at", as_utc(self.at, field_name="at"))
        if not self.load_id.strip():
            raise ValueError("load_id must not be empty")
        requested = _finite_non_negative(self.requested_w, field_name="requested_w")
        granted = _finite_non_negative(self.granted_w, field_name="granted_w")
        solar = _finite_non_negative(self.solar_allocated_w, field_name="solar_allocated_w")
        if granted > requested + 1e-9:
            raise ValueError("granted_w cannot exceed requested_w")
        if solar > granted + 1e-9:
            raise ValueError("solar_allocated_w cannot exceed granted_w")
        if self.accepted != (granted > 0):
            raise ValueError("accepted must match whether a positive grant was made")
        if not all(isinstance(reason, ReasonCode) for reason in self.reasons):
            raise ValueError("reasons must contain ReasonCode values")
        object.__setattr__(self, "requested_w", requested)
        object.__setattr__(self, "granted_w", granted)
        object.__setattr__(self, "solar_allocated_w", solar)
        object.__setattr__(self, "reasons", tuple(self.reasons))


@dataclass(frozen=True, slots=True)
class DecisionEvent:
    at: datetime
    code: ReasonCode
    load_id: str | None = None
    metadata: Metadata = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "at", as_utc(self.at, field_name="at"))
        if self.load_id is not None and not self.load_id.strip():
            raise ValueError("load_id cannot be empty")
        object.__setattr__(self, "metadata", freeze_metadata(self.metadata))


@dataclass(frozen=True, slots=True)
class Override:
    """Persistable manual command intent; expiry is an absolute UTC instant."""

    load_id: str
    mode: OverrideMode
    created_at: datetime
    expires_at: datetime | None = None

    def __post_init__(self) -> None:
        if not self.load_id.strip():
            raise ValueError("load_id must not be empty")
        created = as_utc(self.created_at, field_name="created_at")
        object.__setattr__(self, "created_at", created)
        if self.expires_at is not None:
            expiry = as_utc(self.expires_at, field_name="expires_at")
            if expiry <= created:
                raise ValueError("expires_at must be after created_at")
            object.__setattr__(self, "expires_at", expiry)

    @property
    def indefinite(self) -> bool:
        return self.expires_at is None

    def is_active_at(self, at: datetime) -> bool:
        instant = as_utc(at, field_name="at")
        return instant >= self.created_at and (self.expires_at is None or instant < self.expires_at)


@dataclass(frozen=True, slots=True)
class LearningEstimate:
    load_id: str
    expected_power_w: float
    expected_duration_s: float
    confidence: float
    sample_count: int
    source: str = "configured"

    def __post_init__(self) -> None:
        if not self.load_id.strip():
            raise ValueError("load_id must not be empty")
        object.__setattr__(
            self,
            "expected_power_w",
            _finite_non_negative(self.expected_power_w, field_name="expected_power_w"),
        )
        object.__setattr__(
            self,
            "expected_duration_s",
            _finite_non_negative(self.expected_duration_s, field_name="expected_duration_s"),
        )
        confidence = float(self.confidence)
        if not isfinite(confidence) or not 0 <= confidence <= 1:
            raise ValueError("confidence must be between 0 and 1")
        if self.sample_count < 0:
            raise ValueError("sample_count must not be negative")
        object.__setattr__(self, "confidence", confidence)


@dataclass(frozen=True, slots=True)
class ForecastPoint:
    """A forecast sample used by the planner for a slot beginning at ``at``.

    A point without ``valid_until_at`` applies only to the slot beginning at
    ``at``.  This deliberately prevents a stale last observation from being
    extrapolated across the whole horizon and creating a false solar guarantee.
    """

    at: datetime
    solar_generation_w: float = 0.0
    base_import_w: float = 0.0
    confidence: float | None = None
    valid_until_at: datetime | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "at", as_utc(self.at, field_name="at"))
        object.__setattr__(
            self,
            "solar_generation_w",
            _finite_non_negative(self.solar_generation_w, field_name="solar_generation_w"),
        )
        base = float(self.base_import_w)
        if not isfinite(base):
            raise ValueError("base_import_w must be finite")
        object.__setattr__(self, "base_import_w", base)
        if self.confidence is not None:
            confidence = float(self.confidence)
            if not isfinite(confidence) or not 0 <= confidence <= 1:
                raise ValueError("confidence must be between 0 and 1")
            object.__setattr__(self, "confidence", confidence)
        if self.valid_until_at is not None:
            valid_until = as_utc(self.valid_until_at, field_name="valid_until_at")
            if valid_until <= self.at:
                raise ValueError("valid_until_at must be after at")
            object.__setattr__(self, "valid_until_at", valid_until)

    def is_valid_at(self, at: datetime) -> bool:
        """Whether this point may safely be used for the supplied slot instant."""

        instant = as_utc(at, field_name="at")
        if self.valid_until_at is None:
            return instant == self.at
        return self.at <= instant < self.valid_until_at


@dataclass(frozen=True, slots=True)
class CommandProposal:
    load_id: str
    action: CommandAction
    source: CommandSource
    requested_power_w: float | None = None

    def __post_init__(self) -> None:
        if not self.load_id.strip():
            raise ValueError("load_id must not be empty")
        if self.action is CommandAction.SET_POWER:
            if self.requested_power_w is None:
                raise ValueError("set_power proposals require requested_power_w")
        if self.requested_power_w is not None:
            object.__setattr__(
                self,
                "requested_power_w",
                _finite_non_negative(self.requested_power_w, field_name="requested_power_w"),
            )
