"""Deterministic 24-hour, five-minute plan allocator.

This is intentionally a transparent greedy allocator rather than an external
solver.  It produces the same plan for equal immutable inputs and keeps the
objective ordering inspectable: safety/capacity first, mandatory and deadline
work next, then cost, switch reduction, solar use, priority and fairness.
Final real-time authority still belongs to :mod:`.arbitrator`.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from math import ceil, isfinite

from .models import ForecastPoint, LoadRequest, PlanInterval, ReasonCode, SiteConfigV1, as_utc
from .schedule import is_active_at
from .tariff import TariffTimeline, split_interval_cost


@dataclass(frozen=True, slots=True)
class PlannerSettings:
    """Default V1 horizon: 288 deterministic five-minute slots."""

    slot_seconds: int = 5 * 60
    horizon_seconds: int = 24 * 60 * 60

    def __post_init__(self) -> None:
        if self.slot_seconds <= 0 or self.horizon_seconds <= 0:
            raise ValueError("planner durations must be positive")
        if self.horizon_seconds % self.slot_seconds:
            raise ValueError("horizon_seconds must divide evenly into slot_seconds")

    @property
    def slot_count(self) -> int:
        return self.horizon_seconds // self.slot_seconds


@dataclass(frozen=True, slots=True)
class PlanningInput:
    now: datetime
    site: SiteConfigV1
    requests: tuple[LoadRequest, ...]
    tariffs: TariffTimeline = TariffTimeline(())
    forecasts: tuple[ForecastPoint, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "now", as_utc(self.now, field_name="now"))
        requests = tuple(self.requests)
        if not all(isinstance(request, LoadRequest) for request in requests):
            raise ValueError("requests must contain LoadRequest values")
        ids = [request.load_id for request in requests]
        if len(ids) != len(set(ids)):
            raise ValueError("planning input must contain at most one request per load")
        object.__setattr__(self, "requests", requests)
        if not isinstance(self.tariffs, TariffTimeline):
            raise ValueError("tariffs must be a TariffTimeline")
        raw_forecasts = tuple(self.forecasts)
        if not all(isinstance(forecast, ForecastPoint) for forecast in raw_forecasts):
            raise ValueError("forecasts must contain ForecastPoint values")
        forecasts = tuple(sorted(raw_forecasts, key=lambda forecast: forecast.at))
        if any(left.at == right.at for left, right in zip(forecasts, forecasts[1:], strict=False)):
            raise ValueError("forecasts must not contain duplicate timestamps")
        object.__setattr__(self, "forecasts", forecasts)


@dataclass(frozen=True, slots=True)
class PlanSlot:
    start_at: datetime
    end_at: datetime
    capacity_w: float
    allocated_w: float
    solar_allocated_w: float

    def __post_init__(self) -> None:
        start = as_utc(self.start_at, field_name="start_at")
        end = as_utc(self.end_at, field_name="end_at")
        if end <= start:
            raise ValueError("slot end_at must follow start_at")
        powers = (self.capacity_w, self.allocated_w, self.solar_allocated_w)
        if any(not isfinite(float(value)) or value < 0 for value in powers):
            raise ValueError("slot power values must be finite and non-negative")
        if self.allocated_w > self.capacity_w + 1e-6:
            raise ValueError("allocated_w cannot exceed capacity_w")
        if self.solar_allocated_w > self.allocated_w + 1e-6:
            raise ValueError("solar allocation cannot exceed allocated power")
        object.__setattr__(self, "start_at", start)
        object.__setattr__(self, "end_at", end)


@dataclass(frozen=True, slots=True)
class LoadPlanResult:
    load_id: str
    required_slots: int
    scheduled_slots: int
    unmet_slots: int
    expected_cost: Decimal
    reasons: tuple[ReasonCode, ...]

    def __post_init__(self) -> None:
        if self.required_slots < 0 or self.scheduled_slots < 0 or self.unmet_slots < 0:
            raise ValueError("slot counts must be non-negative")
        if self.unmet_slots != max(0, self.required_slots - self.scheduled_slots):
            raise ValueError("unmet_slots must match required minus scheduled slots")
        object.__setattr__(self, "reasons", tuple(self.reasons))


@dataclass(frozen=True, slots=True)
class PlanResult:
    generated_at: datetime
    horizon_end_at: datetime
    slot_seconds: int
    intervals: tuple[PlanInterval, ...]
    slots: tuple[PlanSlot, ...]
    loads: tuple[LoadPlanResult, ...]
    warnings: tuple[ReasonCode, ...] = ()

    def __post_init__(self) -> None:
        generated = as_utc(self.generated_at, field_name="generated_at")
        end = as_utc(self.horizon_end_at, field_name="horizon_end_at")
        if end <= generated:
            raise ValueError("horizon must end after generation")
        if self.slot_seconds <= 0:
            raise ValueError("slot_seconds must be positive")
        object.__setattr__(self, "generated_at", generated)
        object.__setattr__(self, "horizon_end_at", end)
        object.__setattr__(
            self,
            "intervals",
            tuple(sorted(self.intervals, key=lambda item: (item.start_at, item.load_id))),
        )
        object.__setattr__(self, "slots", tuple(self.slots))
        object.__setattr__(self, "loads", tuple(sorted(self.loads, key=lambda item: item.load_id)))
        object.__setattr__(self, "warnings", tuple(self.warnings))

    @property
    def is_feasible(self) -> bool:
        return all(result.unmet_slots == 0 for result in self.loads)


@dataclass(slots=True)
class _MutableSlot:
    start_at: datetime
    end_at: datetime
    capacity_w: float
    solar_remaining_w: float
    allocated_w: float = 0.0
    solar_allocated_w: float = 0.0

    @property
    def remaining_w(self) -> float:
        return max(0.0, self.capacity_w - self.allocated_w)


@dataclass(frozen=True, slots=True)
class _Assignment:
    request: LoadRequest
    slot_index: int
    solar_w: float
    cost: Decimal
    tariff_missing: bool


class DeterministicPlanner:
    """Pure deterministic planner; construct once and reuse safely."""

    def __init__(self, settings: PlannerSettings | None = None) -> None:
        self._settings = settings if settings is not None else PlannerSettings()

    @property
    def settings(self) -> PlannerSettings:
        return self._settings

    def plan(self, planning: PlanningInput) -> PlanResult:
        now = planning.now
        first_slot = _ceil_to_slot(now, self._settings.slot_seconds)
        slots = _make_slots(first_slot, self._settings, planning.site, planning.forecasts)
        assignments: list[_Assignment] = []
        results: list[LoadPlanResult] = []
        warnings: set[ReasonCode] = set()

        # This stable order implements the priority layers that must occur
        # before price selection.  Scarcer deadlines naturally win over a later
        # non-mandatory/cost-only request; lexical load_id is the final tie-break.
        ordered = sorted(planning.requests, key=_request_order_key)
        for request in ordered:
            required = request.required_slot_count(self._settings.slot_seconds)
            if required == 0:
                results.append(
                    LoadPlanResult(
                        load_id=request.load_id,
                        required_slots=0,
                        scheduled_slots=0,
                        unmet_slots=0,
                        expected_cost=Decimal("0"),
                        reasons=(ReasonCode.LOAD_COMPLETE,),
                    )
                )
                continue

            eligible = _eligible_slot_indices(request, slots, planning.site.timezone)
            allow_missing_tariff = _must_complete(request)
            selected: list[_Assignment] = []
            block_size = max(
                1, _ceil_positive(request.min_contiguous_s, self._settings.slot_seconds)
            )
            while len(selected) < required:
                group_size = block_size if required - len(selected) > 0 else 1
                candidate = _best_candidate_block(
                    request=request,
                    eligible=eligible,
                    slots=slots,
                    selected_indices={assignment.slot_index for assignment in selected},
                    group_size=group_size,
                    tariffs=planning.tariffs,
                    slot_seconds=self._settings.slot_seconds,
                    allow_missing_tariff=allow_missing_tariff,
                )
                if candidate is None:
                    break
                for index in candidate:
                    assignment = _allocate_slot(
                        request, index, slots, planning.tariffs, self._settings.slot_seconds
                    )
                    selected.append(assignment)
                    assignments.append(assignment)
                # A minimum contiguous run may deliberately complete more full
                # slots than the remaining target; report the safe over-plan.
                if len(selected) >= required:
                    break

            scheduled = len(selected)
            unmet = max(0, required - scheduled)
            reasons = _result_reasons(request, eligible, selected, unmet, slots, planning.tariffs)
            warnings.update(reason for reason in reasons if reason is ReasonCode.TARIFF_UNAVAILABLE)
            results.append(
                LoadPlanResult(
                    load_id=request.load_id,
                    required_slots=required,
                    scheduled_slots=scheduled,
                    unmet_slots=unmet,
                    expected_cost=sum((assignment.cost for assignment in selected), Decimal("0")),
                    reasons=reasons,
                )
            )

        intervals = tuple(
            PlanInterval(
                load_id=assignment.request.load_id,
                start_at=slots[assignment.slot_index].start_at,
                end_at=slots[assignment.slot_index].end_at,
                power_w=assignment.request.requested_power_w,
                solar_allocated_w=assignment.solar_w,
                expected_cost=assignment.cost,
                reason=ReasonCode.PLAN_SELECTED,
            )
            for assignment in assignments
        )
        public_slots = tuple(
            PlanSlot(
                start_at=slot.start_at,
                end_at=slot.end_at,
                capacity_w=slot.capacity_w,
                allocated_w=slot.allocated_w,
                solar_allocated_w=slot.solar_allocated_w,
            )
            for slot in slots
        )
        return PlanResult(
            generated_at=now,
            horizon_end_at=slots[-1].end_at,
            slot_seconds=self._settings.slot_seconds,
            intervals=intervals,
            slots=public_slots,
            loads=tuple(results),
            warnings=tuple(sorted(warnings, key=str)),
        )


def plan_24h(planning: PlanningInput) -> PlanResult:
    """Convenience API for the V1 fixed 24-hour/five-minute planner."""

    return DeterministicPlanner().plan(planning)


def latest_safe_start_at(
    deadline_at: datetime,
    *,
    remaining_runtime_s: float,
    safety_margin_s: float = 0.0,
) -> datetime:
    """Return the latest UTC instant a runtime target may safely begin.

    More detailed adapter constraints (minimum off time, thermal duty cycle or
    variable current) are folded into ``remaining_runtime_s`` by the boundary;
    this primitive remains deterministic and useful for preview explanations.
    """

    runtime = float(remaining_runtime_s)
    margin = float(safety_margin_s)
    if not isfinite(runtime) or not isfinite(margin) or runtime < 0 or margin < 0:
        raise ValueError("remaining_runtime_s and safety_margin_s must be finite and non-negative")
    return as_utc(deadline_at, field_name="deadline_at") - timedelta(seconds=runtime + margin)


def _request_order_key(request: LoadRequest) -> tuple[object, ...]:
    mandatory = request.mandatory or any(window.mandatory for window in request.allowed_windows)
    # Manual commands have already been applied/validated elsewhere; planning
    # treats only normal requests.  Negative timestamps avoid platform-specific
    # datetime max sentinels while maintaining deterministic ordering.
    deadline_rank = (
        request.deadline_at.timestamp() if request.deadline_at is not None else float("inf")
    )
    return (
        0 if mandatory else 1,
        0 if request.deadline_at is not None else 1,
        deadline_rank,
        -request.priority,
        -request.fairness_debt,
        request.load_id,
    )


def _make_slots(
    first_slot: datetime,
    settings: PlannerSettings,
    site: SiteConfigV1,
    forecasts: tuple[ForecastPoint, ...],
) -> list[_MutableSlot]:
    slots: list[_MutableSlot] = []
    forecast_index = 0
    current_forecast: ForecastPoint | None = None
    for index in range(settings.slot_count):
        start = first_slot + timedelta(seconds=index * settings.slot_seconds)
        end = start + timedelta(seconds=settings.slot_seconds)
        while forecast_index < len(forecasts) and forecasts[forecast_index].at <= start:
            current_forecast = forecasts[forecast_index]
            forecast_index += 1
        valid_forecast = (
            current_forecast
            if current_forecast is not None and current_forecast.is_valid_at(start)
            else None
        )
        base_import_w = 0.0 if valid_forecast is None else max(0.0, valid_forecast.base_import_w)
        solar_w = 0.0 if valid_forecast is None else valid_forecast.solar_generation_w
        automatic_limit = (
            site.controlled_import_limit_w
            if site.controlled_import_limit_w is not None
            else site.hard_import_limit_w
        )
        # ``base_import_w`` is the predicted non-controllable consumption before
        # solar allocation.  Solar is added once here and decremented once when
        # a request is allocated, preventing double counting.
        capacity = max(0.0, automatic_limit - base_import_w + solar_w)
        slots.append(_MutableSlot(start, end, capacity, solar_w))
    return slots


def _eligible_slot_indices(
    request: LoadRequest, slots: list[_MutableSlot], timezone: str
) -> tuple[int, ...]:
    eligible: list[int] = []
    for index, slot in enumerate(slots):
        if request.earliest_start_at is not None and slot.start_at < request.earliest_start_at:
            continue
        if request.deadline_at is not None and slot.end_at > request.deadline_at:
            continue
        if not is_active_at(slot.start_at, timezone, request.allowed_windows):
            continue
        eligible.append(index)
    return tuple(eligible)


def _best_candidate_block(
    *,
    request: LoadRequest,
    eligible: tuple[int, ...],
    slots: list[_MutableSlot],
    selected_indices: set[int],
    group_size: int,
    tariffs: TariffTimeline,
    slot_seconds: int,
    allow_missing_tariff: bool,
) -> tuple[int, ...] | None:
    eligible_set = set(eligible)
    candidates: list[tuple[tuple[object, ...], tuple[int, ...]]] = []
    for start in eligible:
        indices = tuple(range(start, start + group_size))
        if any(index not in eligible_set or index in selected_indices for index in indices):
            continue
        if any(slots[index].remaining_w + 1e-9 < request.requested_power_w for index in indices):
            continue
        candidate_data = [
            _candidate_slot_cost(request, slots[index], tariffs, slot_seconds) for index in indices
        ]
        missing_count = sum(item[2] for item in candidate_data)
        if missing_count and not allow_missing_tariff:
            continue
        cost = sum((item[0] for item in candidate_data), Decimal("0"))
        solar = sum(item[1] for item in candidate_data)
        # This request's existing adjacent allocations are favoured after cost;
        # it reduces unnecessary switching without overriding a cheaper slot.
        switches = _additional_switches(indices, selected_indices)
        score: tuple[object, ...] = (
            missing_count,
            cost,
            switches,
            -solar,
            -request.priority,
            -request.fairness_debt,
            start,
        )
        candidates.append((score, indices))
    return min(candidates, key=lambda candidate: candidate[0])[1] if candidates else None


def _candidate_slot_cost(
    request: LoadRequest,
    slot: _MutableSlot,
    tariffs: TariffTimeline,
    slot_seconds: int,
) -> tuple[Decimal, float, bool]:
    solar_w = min(request.requested_power_w, slot.solar_remaining_w)
    tariff = tariffs.at(slot.start_at)
    if tariff is None:
        # Mandatory/deadline work can still be scheduled safely, but an absent
        # price is never allowed to look artificially cheaper than a known one.
        return Decimal("1E+30"), solar_w, True
    cost = split_interval_cost(
        power_w=request.requested_power_w,
        duration_s=slot_seconds,
        tariff=tariff,
        solar_power_w=solar_w,
    ).cost
    return cost, solar_w, False


def _allocate_slot(
    request: LoadRequest,
    index: int,
    slots: list[_MutableSlot],
    tariffs: TariffTimeline,
    slot_seconds: int,
) -> _Assignment:
    slot = slots[index]
    if slot.remaining_w + 1e-9 < request.requested_power_w:
        raise RuntimeError("planner attempted to allocate beyond a slot's hard capacity")
    cost, solar_w, tariff_missing = _candidate_slot_cost(request, slot, tariffs, slot_seconds)
    slot.allocated_w += request.requested_power_w
    slot.solar_allocated_w += solar_w
    slot.solar_remaining_w = max(0.0, slot.solar_remaining_w - solar_w)
    return _Assignment(
        request=request, slot_index=index, solar_w=solar_w, cost=cost, tariff_missing=tariff_missing
    )


def _result_reasons(
    request: LoadRequest,
    eligible: tuple[int, ...],
    selected: list[_Assignment],
    unmet: int,
    slots: list[_MutableSlot],
    tariffs: TariffTimeline,
) -> tuple[ReasonCode, ...]:
    reasons: list[ReasonCode] = []
    if not eligible:
        reasons.append(
            ReasonCode.OUTSIDE_WINDOW if request.allowed_windows else ReasonCode.DEADLINE_IMPOSSIBLE
        )
    if any(item.tariff_missing for item in selected) or any(
        tariffs.at(slots[index].start_at) is None for index in eligible
    ):
        reasons.append(ReasonCode.TARIFF_UNAVAILABLE)
    if unmet:
        reasons.append(
            ReasonCode.DEADLINE_IMPOSSIBLE
            if request.deadline_at is not None
            else ReasonCode.PLAN_NOT_SELECTED
        )
    else:
        reasons.append(ReasonCode.PLAN_SELECTED)
    return tuple(dict.fromkeys(reasons))


def _must_complete(request: LoadRequest) -> bool:
    return (
        request.mandatory
        or request.deadline_at is not None
        or any(window.mandatory for window in request.allowed_windows)
    )


def _ceil_to_slot(at: datetime, slot_seconds: int) -> datetime:
    instant = as_utc(at, field_name="at")
    epoch = datetime(1970, 1, 1, tzinfo=UTC)
    delta = instant - epoch
    total_microseconds = ((delta.days * 86400 + delta.seconds) * 1_000_000) + delta.microseconds
    slot_microseconds = slot_seconds * 1_000_000
    slots = (total_microseconds + slot_microseconds - 1) // slot_microseconds
    return epoch + timedelta(microseconds=slots * slot_microseconds)


def _ceil_positive(value: float, unit: int) -> int:
    if value <= 0:
        return 0
    return ceil(value / unit)


def _additional_switches(indices: tuple[int, ...], selected: set[int]) -> int:
    # A new contiguous block has two transitions unless it joins an existing
    # block at either side.  The exact count only matters as a tie-break.
    start, end = indices[0], indices[-1]
    return int(start - 1 not in selected) + int(end + 1 not in selected)
