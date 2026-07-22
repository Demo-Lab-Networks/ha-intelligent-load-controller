"""Authoritative real-time site allocation for automatic load requests."""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime
from math import isfinite

from .models import (
    CommandSource,
    LoadRequest,
    PhaseValuesInput,
    ReasonCode,
    SiteAllocation,
    SiteConfigV1,
    SitePowerSnapshot,
    as_utc,
    freeze_phase_values,
)


@dataclass(frozen=True, slots=True)
class ArbitrationInput:
    """The complete observed state required for one pure allocation decision.

    ``uncontrolled_import_w`` and ``uncontrolled_phase_import_w`` should exclude
    power already attributed to controllable loads.  If absent, the current site
    snapshot is used conservatively.  ``available_solar_w`` is allocatable only
    once during this decision; it is not a per-load allowance.
    """

    at: datetime
    site: SiteConfigV1
    snapshot: SitePowerSnapshot
    requests: tuple[LoadRequest, ...]
    automatic_enabled: bool = True
    observation_ready: bool = True
    uncontrolled_import_w: float | None = None
    uncontrolled_phase_import_w: PhaseValuesInput = ()
    available_solar_w: float | None = None
    last_automatic_start_at: datetime | None = None
    max_input_age_s: float | None = None
    existing_binary_load_count: int = 0

    def __post_init__(self) -> None:
        object.__setattr__(self, "at", as_utc(self.at, field_name="at"))
        requests = tuple(self.requests)
        ids = [request.load_id for request in requests]
        if len(ids) != len(set(ids)):
            raise ValueError("arbitration input must contain at most one request per load")
        object.__setattr__(self, "requests", requests)
        if self.uncontrolled_import_w is not None:
            value = float(self.uncontrolled_import_w)
            if not isfinite(value):
                raise ValueError("uncontrolled_import_w must be finite")
            object.__setattr__(self, "uncontrolled_import_w", value)
        object.__setattr__(
            self,
            "uncontrolled_phase_import_w",
            freeze_phase_values(
                self.uncontrolled_phase_import_w,
                field_name="uncontrolled_phase_import_w",
                allow_negative=True,
            ),
        )
        if self.available_solar_w is not None:
            value = float(self.available_solar_w)
            if not isfinite(value) or value < 0:
                raise ValueError("available_solar_w must be a finite non-negative number")
            object.__setattr__(self, "available_solar_w", value)
        if self.last_automatic_start_at is not None:
            object.__setattr__(
                self,
                "last_automatic_start_at",
                as_utc(self.last_automatic_start_at, field_name="last_automatic_start_at"),
            )
        if self.max_input_age_s is not None:
            value = float(self.max_input_age_s)
            if not isfinite(value) or value < 0:
                raise ValueError("max_input_age_s must be a finite non-negative number")
            object.__setattr__(self, "max_input_age_s", value)
        if (
            isinstance(self.existing_binary_load_count, bool)
            or not isinstance(self.existing_binary_load_count, int)
            or self.existing_binary_load_count < 0
        ):
            raise ValueError("existing_binary_load_count must be a non-negative integer")


@dataclass(frozen=True, slots=True)
class ArbitrationResult:
    at: datetime
    allocations: tuple[SiteAllocation, ...]
    hard_limit_w: float
    controlled_limit_w: float
    baseline_import_w: float
    available_solar_w: float

    def __post_init__(self) -> None:
        object.__setattr__(self, "at", as_utc(self.at, field_name="at"))
        object.__setattr__(
            self,
            "allocations",
            tuple(sorted(self.allocations, key=lambda allocation: allocation.load_id)),
        )
        for field_name in (
            "hard_limit_w",
            "controlled_limit_w",
            "baseline_import_w",
            "available_solar_w",
        ):
            value = float(getattr(self, field_name))
            if not isfinite(value) or (field_name != "baseline_import_w" and value < 0):
                requirement = (
                    "finite" if field_name == "baseline_import_w" else "finite and non-negative"
                )
                raise ValueError(f"{field_name} must be {requirement}")
            object.__setattr__(self, field_name, value)

    @property
    def total_granted_w(self) -> float:
        return sum(item.granted_w for item in self.allocations)

    @property
    def total_solar_allocated_w(self) -> float:
        return sum(item.solar_allocated_w for item in self.allocations)


class SiteArbitrator:
    """The sole allocator of positive automatic power grants at site level."""

    def arbitrate(self, decision: ArbitrationInput) -> ArbitrationResult:
        baseline_import = (
            decision.snapshot.grid_import_w
            if decision.uncontrolled_import_w is None
            else decision.uncontrolled_import_w
        )
        # Negative net import/export cannot reduce the known electrical safety
        # requirement; separately supplied solar is the only allocatable surplus.
        baseline_import = max(0.0, baseline_import)
        available_solar = (
            max(0.0, decision.snapshot.solar_generation_w or 0.0)
            if decision.available_solar_w is None
            else decision.available_solar_w
        )
        hard_limit = decision.site.hard_import_limit_w
        controlled_limit = (
            decision.site.controlled_import_limit_w
            if decision.site.controlled_import_limit_w is not None
            else hard_limit
        )
        phase_baseline = dict(decision.uncontrolled_phase_import_w) or dict(
            decision.snapshot.phase_import_w
        )
        total_granted = 0.0
        solar_remaining = available_solar
        phase_granted: dict[str, float] = {}
        allocations: list[SiteAllocation] = []
        inputs_safe, input_reason = _inputs_safe(decision)
        last_automatic_start_at = decision.last_automatic_start_at
        active_binary_load_count = decision.existing_binary_load_count + sum(
            1
            for request in decision.requests
            if _is_binary_request(request) and request.current_power_w > 0
        )

        for request in sorted(decision.requests, key=_arbitration_order_key):
            denied = _precondition_reason(request, decision, inputs_safe, input_reason)
            if denied is not None:
                allocations.append(_denied(decision.at, request, denied))
                continue
            stagger_reason = _stagger_reason(
                request, decision.at, last_automatic_start_at, decision.site.start_stagger_s
            )
            if stagger_reason is not None:
                allocations.append(_denied(decision.at, request, stagger_reason))
                continue
            if _would_exceed_binary_count(request, decision.site, active_binary_load_count):
                allocations.append(
                    _denied(decision.at, request, ReasonCode.MAX_SIMULTANEOUS_BINARY_LOADS)
                )
                continue

            limit = (
                hard_limit
                if request.control_source is not CommandSource.AUTOMATIC
                else controlled_limit
            )
            global_headroom = max(0.0, limit - baseline_import + available_solar - total_granted)
            hard_headroom = max(0.0, hard_limit - baseline_import + available_solar - total_granted)
            phase_headroom = _phase_headroom(request, decision.site, phase_baseline, phase_granted)
            effective_headroom = min(global_headroom, phase_headroom)
            target = min(request.requested_power_w, request.maximum_grant_w)
            grant = _grant_for_request(request, target, effective_headroom)
            if grant <= 0:
                reason = _capacity_reason(
                    request,
                    global_headroom=global_headroom,
                    hard_headroom=hard_headroom,
                    phase_headroom=phase_headroom,
                    controlled_limit=controlled_limit,
                    hard_limit=hard_limit,
                )
                allocations.append(_denied(decision.at, request, reason))
                continue

            solar_grant = min(grant, solar_remaining)
            solar_remaining -= solar_grant
            total_granted += grant
            if request.phase is not None:
                phase_granted[request.phase] = phase_granted.get(request.phase, 0.0) + grant
            if _is_binary_request(request) and request.current_power_w <= 0:
                active_binary_load_count += 1
            if request.control_source is CommandSource.AUTOMATIC and request.current_power_w <= 0:
                last_automatic_start_at = decision.at
            reasons = (
                (ReasonCode.SETPOINT_BOUNDED,)
                if grant + 1e-9 < target
                else (ReasonCode.PLAN_SELECTED,)
            )
            allocations.append(
                SiteAllocation(
                    at=decision.at,
                    load_id=request.load_id,
                    requested_w=request.requested_power_w,
                    granted_w=grant,
                    solar_allocated_w=solar_grant,
                    accepted=True,
                    reasons=reasons,
                )
            )
        _assert_safety_invariants(
            total_granted_w=total_granted,
            solar_allocated_w=available_solar - solar_remaining,
            hard_limit_w=hard_limit,
            baseline_import_w=baseline_import,
            available_solar_w=available_solar,
        )
        return ArbitrationResult(
            at=decision.at,
            allocations=tuple(allocations),
            hard_limit_w=hard_limit,
            controlled_limit_w=controlled_limit,
            baseline_import_w=baseline_import,
            available_solar_w=available_solar,
        )

    def allocate(
        self,
        *,
        at: datetime,
        site: SiteConfigV1,
        snapshot: SitePowerSnapshot,
        requests: Iterable[LoadRequest],
        automatic_enabled: bool = True,
        observation_ready: bool = True,
        uncontrolled_import_w: float | None = None,
        available_solar_w: float | None = None,
        existing_binary_load_count: int = 0,
    ) -> ArbitrationResult:
        """Small convenience wrapper around :meth:`arbitrate`."""

        return self.arbitrate(
            ArbitrationInput(
                at=at,
                site=site,
                snapshot=snapshot,
                requests=tuple(requests),
                automatic_enabled=automatic_enabled,
                observation_ready=observation_ready,
                uncontrolled_import_w=uncontrolled_import_w,
                available_solar_w=available_solar_w,
                existing_binary_load_count=existing_binary_load_count,
            )
        )


def _arbitration_order_key(request: LoadRequest) -> tuple[object, ...]:
    # Manual control normally outranks cost/priority but cannot cross hard
    # capacity.  Mandatory/deadline requests come next, followed by fairness.
    manual_rank = 0 if request.control_source is CommandSource.MANUAL else 1
    mandatory_rank = 0 if request.mandatory else 1
    deadline_rank = (
        request.deadline_at.timestamp() if request.deadline_at is not None else float("inf")
    )
    return (
        manual_rank,
        mandatory_rank,
        deadline_rank,
        -request.priority,
        -request.fairness_debt,
        request.load_id,
    )


def _inputs_safe(decision: ArbitrationInput) -> tuple[bool, ReasonCode | None]:
    if not decision.snapshot.available:
        return False, ReasonCode.INPUT_MISSING
    observed_age_s = (decision.at - decision.snapshot.at).total_seconds()
    # A future timestamp is not trustworthy evidence for a present electrical
    # safety decision.  Treat it as stale rather than assuming an arbitrary
    # clock skew is harmless.
    if observed_age_s < 0:
        return False, ReasonCode.INPUT_STALE
    effective_age_s = max(decision.snapshot.input_age_s, observed_age_s)
    if decision.max_input_age_s is not None and effective_age_s > decision.max_input_age_s:
        return False, ReasonCode.INPUT_STALE
    return True, None


def _precondition_reason(
    request: LoadRequest,
    decision: ArbitrationInput,
    inputs_safe: bool,
    input_reason: ReasonCode | None,
) -> ReasonCode | None:
    if (
        request.control_source in (CommandSource.AUTOMATIC, CommandSource.RECOVERY)
        and not decision.automatic_enabled
    ):
        return ReasonCode.AUTOMATIC_DISABLED
    if (
        request.control_source in (CommandSource.AUTOMATIC, CommandSource.RECOVERY)
        and not decision.observation_ready
    ):
        return ReasonCode.STARTUP_OBSERVING
    # Positive grants with stale/missing power observations cannot demonstrate
    # hard-limit safety, including manual requests.  Existing outputs are not
    # changed here; this is only an authorization result.
    if not inputs_safe:
        return input_reason
    return None


def _stagger_reason(
    request: LoadRequest,
    at: datetime,
    last_automatic_start_at: datetime | None,
    start_stagger_s: float,
) -> ReasonCode | None:
    if request.control_source is not CommandSource.AUTOMATIC or request.current_power_w > 0:
        return None
    if (
        last_automatic_start_at is not None
        and (at - last_automatic_start_at).total_seconds() < start_stagger_s
    ):
        return ReasonCode.START_STAGGER
    return None


def _is_binary_request(request: LoadRequest) -> bool:
    """Treat fixed-power requests as binary for the site equipment cap."""

    return not request.is_variable_power


def _would_exceed_binary_count(
    request: LoadRequest,
    site: SiteConfigV1,
    active_binary_load_count: int,
) -> bool:
    """Apply a hard simultaneous-binary-load limit to new starts only."""

    return (
        site.max_simultaneous_binary_loads is not None
        and _is_binary_request(request)
        and request.current_power_w <= 0
        and active_binary_load_count >= site.max_simultaneous_binary_loads
    )


def _phase_headroom(
    request: LoadRequest,
    site: SiteConfigV1,
    baseline: dict[str, float],
    allocated: dict[str, float],
) -> float:
    if request.phase is None:
        return float("inf")
    phase_limit = site.phase_hard_limit_w(request.phase)
    if phase_limit is None:
        return float("inf")
    # Do not assign aggregate solar against a phase-specific safety ceiling: its
    # per-phase distribution is unknown in V1, so this deliberately errs safe.
    return max(
        0.0,
        phase_limit
        - max(0.0, baseline.get(request.phase, 0.0))
        - allocated.get(request.phase, 0.0),
    )


def _grant_for_request(request: LoadRequest, target: float, headroom: float) -> float:
    if not request.is_variable_power:
        return target if headroom + 1e-9 >= target else 0.0
    grant = min(target, headroom)
    return grant if grant + 1e-9 >= request.minimum_grant_w else 0.0


def _capacity_reason(
    request: LoadRequest,
    *,
    global_headroom: float,
    hard_headroom: float,
    phase_headroom: float,
    controlled_limit: float,
    hard_limit: float,
) -> ReasonCode:
    minimum = request.minimum_grant_w
    if phase_headroom + 1e-9 < minimum:
        return ReasonCode.PHASE_LIMIT
    if hard_headroom + 1e-9 < minimum:
        return ReasonCode.HARD_SITE_LIMIT
    if controlled_limit < hard_limit and global_headroom + 1e-9 < minimum:
        return ReasonCode.CONTROLLED_SITE_LIMIT
    return ReasonCode.HARD_SITE_LIMIT


def _denied(at: datetime, request: LoadRequest, reason: ReasonCode) -> SiteAllocation:
    return SiteAllocation(
        at=at,
        load_id=request.load_id,
        requested_w=request.requested_power_w,
        granted_w=0.0,
        solar_allocated_w=0.0,
        accepted=False,
        reasons=(reason,),
    )


def _assert_safety_invariants(
    *,
    total_granted_w: float,
    solar_allocated_w: float,
    hard_limit_w: float,
    baseline_import_w: float,
    available_solar_w: float,
) -> None:
    """Fail closed if an internal arithmetic regression would breach a limit."""

    hard_capacity_w = max(0.0, hard_limit_w - baseline_import_w + available_solar_w)
    if total_granted_w > hard_capacity_w + 1e-6:
        raise RuntimeError("arbitrator invariant violated: grant exceeds hard site capacity")
    if solar_allocated_w > available_solar_w + 1e-6:
        raise RuntimeError("arbitrator invariant violated: solar was allocated more than once")
