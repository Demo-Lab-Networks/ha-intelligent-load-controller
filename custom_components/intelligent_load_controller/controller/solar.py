"""Solar-surplus qualification and anti-flapping policy.

This module returns intent only.  It never calls an actuator, which lets the
site arbitrator remain the sole authority for automatic commands.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from math import isfinite

from .models import ReasonCode, as_utc


class SolarAction(str, Enum):
    NONE = "none"
    START = "start"
    STOP = "stop"


@dataclass(frozen=True, slots=True)
class SolarPolicy:
    """Hysteresis, qualification and cycling limits for one solar-controlled load."""

    start_threshold_w: float
    stop_threshold_w: float
    start_qualification_s: float = 0.0
    stop_qualification_s: float = 0.0
    min_on_s: float = 0.0
    min_off_s: float = 0.0
    max_starts_per_hour: int | None = None
    max_starts_per_day: int | None = None

    def __post_init__(self) -> None:
        for field_name in (
            "start_threshold_w",
            "stop_threshold_w",
            "start_qualification_s",
            "stop_qualification_s",
            "min_on_s",
            "min_off_s",
        ):
            value = float(getattr(self, field_name))
            if not isfinite(value) or value < 0:
                raise ValueError(f"{field_name} must be a finite non-negative number")
            object.__setattr__(self, field_name, value)
        if self.stop_threshold_w > self.start_threshold_w:
            raise ValueError("stop_threshold_w cannot exceed start_threshold_w")
        for field_name in ("max_starts_per_hour", "max_starts_per_day"):
            value = getattr(self, field_name)
            if value is not None and (
                isinstance(value, bool) or not isinstance(value, int) or value < 1
            ):
                raise ValueError(f"{field_name} must be an integer of at least one")


@dataclass(frozen=True, slots=True)
class SolarQualificationState:
    """Persistable absolute-time anchors for qualification and hold timers."""

    start_candidate_at: datetime | None = None
    stop_candidate_at: datetime | None = None
    last_started_at: datetime | None = None
    last_stopped_at: datetime | None = None
    recent_starts_at: tuple[datetime, ...] = ()

    def __post_init__(self) -> None:
        for field_name in (
            "start_candidate_at",
            "stop_candidate_at",
            "last_started_at",
            "last_stopped_at",
        ):
            value = getattr(self, field_name)
            if value is not None:
                object.__setattr__(self, field_name, as_utc(value, field_name=field_name))
        starts = tuple(
            sorted(as_utc(value, field_name="recent_starts_at") for value in self.recent_starts_at)
        )
        object.__setattr__(self, "recent_starts_at", starts)


@dataclass(frozen=True, slots=True)
class SolarDecision:
    action: SolarAction
    state: SolarQualificationState
    reasons: tuple[ReasonCode, ...]

    def __post_init__(self) -> None:
        object.__setattr__(self, "reasons", tuple(self.reasons))


def evaluate_solar(
    *,
    at: datetime,
    available_solar_w: float,
    is_running: bool,
    policy: SolarPolicy,
    state: SolarQualificationState | None = None,
) -> SolarDecision:
    """Evaluate one observation using persisted wall-clock timer anchors.

    ``at`` is supplied by a caller/injected clock rather than read directly, so
    replay and preview produce exactly the same result.  A delayed observation
    naturally satisfies a persisted timer after restart; time going backwards is
    treated conservatively as no elapsed time.
    """

    if state is None:
        state = SolarQualificationState()
    instant = as_utc(at, field_name="at")
    available = float(available_solar_w)
    if not isfinite(available) or available < 0:
        raise ValueError("available_solar_w must be a finite non-negative number")
    recent = _prune_recent_starts(state.recent_starts_at, instant, policy)

    if is_running:
        # A running load cannot be stopped before its equipment minimum-on hold,
        # even when solar disappears.
        if _within_hold(state.last_started_at, instant, policy.min_on_s):
            return SolarDecision(
                SolarAction.NONE,
                SolarQualificationState(
                    stop_candidate_at=None,
                    last_started_at=state.last_started_at,
                    last_stopped_at=state.last_stopped_at,
                    recent_starts_at=recent,
                ),
                (ReasonCode.MINIMUM_ON_HOLD,),
            )
        if available >= policy.stop_threshold_w:
            return SolarDecision(
                SolarAction.NONE,
                SolarQualificationState(
                    stop_candidate_at=None,
                    last_started_at=state.last_started_at,
                    last_stopped_at=state.last_stopped_at,
                    recent_starts_at=recent,
                ),
                (ReasonCode.PLAN_SELECTED,),
            )
        candidate = state.stop_candidate_at or instant
        if _elapsed(candidate, instant) >= policy.stop_qualification_s:
            return SolarDecision(
                SolarAction.STOP,
                SolarQualificationState(
                    last_started_at=state.last_started_at,
                    last_stopped_at=instant,
                    recent_starts_at=recent,
                ),
                (ReasonCode.SOLAR_INSUFFICIENT,),
            )
        return SolarDecision(
            SolarAction.NONE,
            SolarQualificationState(
                stop_candidate_at=candidate,
                last_started_at=state.last_started_at,
                last_stopped_at=state.last_stopped_at,
                recent_starts_at=recent,
            ),
            (ReasonCode.SOLAR_QUALIFYING,),
        )

    # Not running: first preserve a hard off hold, then qualify surplus.
    if _within_hold(state.last_stopped_at, instant, policy.min_off_s):
        return SolarDecision(
            SolarAction.NONE,
            SolarQualificationState(
                last_started_at=state.last_started_at,
                last_stopped_at=state.last_stopped_at,
                recent_starts_at=recent,
            ),
            (ReasonCode.MINIMUM_OFF_HOLD,),
        )
    if available < policy.start_threshold_w:
        return SolarDecision(
            SolarAction.NONE,
            SolarQualificationState(
                last_started_at=state.last_started_at,
                last_stopped_at=state.last_stopped_at,
                recent_starts_at=recent,
            ),
            (ReasonCode.SOLAR_INSUFFICIENT,),
        )

    candidate = state.start_candidate_at or instant
    if _elapsed(candidate, instant) < policy.start_qualification_s:
        return SolarDecision(
            SolarAction.NONE,
            SolarQualificationState(
                start_candidate_at=candidate,
                last_started_at=state.last_started_at,
                last_stopped_at=state.last_stopped_at,
                recent_starts_at=recent,
            ),
            (ReasonCode.SOLAR_QUALIFYING,),
        )
    hourly_starts = tuple(start for start in recent if start > instant - timedelta(hours=1))
    if policy.max_starts_per_hour is not None and len(hourly_starts) >= policy.max_starts_per_hour:
        return SolarDecision(
            SolarAction.NONE,
            SolarQualificationState(
                last_started_at=state.last_started_at,
                last_stopped_at=state.last_stopped_at,
                recent_starts_at=recent,
            ),
            (ReasonCode.EQUIPMENT_LIMIT,),
        )
    if policy.max_starts_per_day is not None and len(recent) >= policy.max_starts_per_day:
        return SolarDecision(
            SolarAction.NONE,
            SolarQualificationState(
                last_started_at=state.last_started_at,
                last_stopped_at=state.last_stopped_at,
                recent_starts_at=recent,
            ),
            (ReasonCode.EQUIPMENT_LIMIT,),
        )
    return SolarDecision(
        SolarAction.START,
        SolarQualificationState(
            last_started_at=instant,
            last_stopped_at=state.last_stopped_at,
            recent_starts_at=recent + (instant,),
        ),
        (ReasonCode.PLAN_SELECTED,),
    )


def _elapsed(start: datetime, end: datetime) -> float:
    return max(0.0, (end - start).total_seconds())


def _within_hold(anchor: datetime | None, at: datetime, hold_s: float) -> bool:
    return anchor is not None and _elapsed(anchor, at) < hold_s


def _prune_recent_starts(
    starts: tuple[datetime, ...],
    at: datetime,
    policy: SolarPolicy,
) -> tuple[datetime, ...]:
    """Keep only the bounded history needed by configured start-rate limits."""

    if policy.max_starts_per_day is not None:
        cutoff = at - timedelta(days=1)
    elif policy.max_starts_per_hour is not None:
        cutoff = at - timedelta(hours=1)
    else:
        return ()
    return tuple(start for start in starts if cutoff < start <= at)
