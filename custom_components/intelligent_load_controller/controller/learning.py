"""Bounded, conservative local learning primitives.

Learning refines planning estimates only.  It deliberately has no reference to
site limits or actuator authority, so it cannot weaken a hard safety limit.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from math import isfinite
from statistics import median

from .models import LearningEstimate, ReasonCode, as_utc


@dataclass(frozen=True, slots=True)
class LearningPolicy:
    configured_power_w: float
    configured_duration_s: float
    minimum_power_w: float
    maximum_power_w: float
    minimum_duration_s: float
    maximum_duration_s: float
    window_size: int = 31
    min_samples: int = 5
    ewma_alpha: float = 0.35
    outlier_ratio: float = 3.0

    def __post_init__(self) -> None:
        for field_name in (
            "configured_power_w",
            "configured_duration_s",
            "minimum_power_w",
            "maximum_power_w",
            "minimum_duration_s",
            "maximum_duration_s",
        ):
            value = float(getattr(self, field_name))
            if not isfinite(value) or value < 0:
                raise ValueError(f"{field_name} must be a finite non-negative number")
            object.__setattr__(self, field_name, value)
        if self.minimum_power_w > self.maximum_power_w:
            raise ValueError("minimum_power_w cannot exceed maximum_power_w")
        if self.minimum_duration_s > self.maximum_duration_s:
            raise ValueError("minimum_duration_s cannot exceed maximum_duration_s")
        if (
            isinstance(self.window_size, bool)
            or isinstance(self.min_samples, bool)
            or not isinstance(self.window_size, int)
            or not isinstance(self.min_samples, int)
            or self.window_size < 1
            or self.min_samples < 1
            or self.min_samples > self.window_size
        ):
            raise ValueError("min_samples must be between one and window_size")
        if not isfinite(float(self.ewma_alpha)) or not 0 < self.ewma_alpha <= 1:
            raise ValueError("ewma_alpha must be finite and in (0, 1]")
        if not isfinite(float(self.outlier_ratio)) or self.outlier_ratio <= 1:
            raise ValueError("outlier_ratio must be finite and greater than one")


@dataclass(frozen=True, slots=True)
class LearningSample:
    observed_at: datetime
    power_w: float
    duration_s: float
    feedback_valid: bool = True

    def __post_init__(self) -> None:
        object.__setattr__(self, "observed_at", as_utc(self.observed_at, field_name="observed_at"))
        if (
            not isfinite(float(self.power_w))
            or not isfinite(float(self.duration_s))
            or self.power_w < 0
            or self.duration_s < 0
        ):
            raise ValueError("sample power and duration must be finite and non-negative")
        object.__setattr__(self, "power_w", float(self.power_w))
        object.__setattr__(self, "duration_s", float(self.duration_s))


@dataclass(frozen=True, slots=True)
class LearningState:
    samples: tuple[LearningSample, ...] = ()
    ewma_power_w: float | None = None
    ewma_duration_s: float | None = None
    frozen: bool = False

    def __post_init__(self) -> None:
        samples = tuple(sorted(self.samples, key=lambda sample: sample.observed_at))
        object.__setattr__(self, "samples", samples)
        for field_name in ("ewma_power_w", "ewma_duration_s"):
            value = getattr(self, field_name)
            if value is not None:
                if not isfinite(value) or value < 0:
                    raise ValueError(f"{field_name} must be a finite non-negative number")
                object.__setattr__(self, field_name, float(value))


@dataclass(frozen=True, slots=True)
class LearningUpdate:
    state: LearningState
    estimate: LearningEstimate
    accepted: bool
    reasons: tuple[ReasonCode, ...]

    def __post_init__(self) -> None:
        object.__setattr__(self, "reasons", tuple(self.reasons))


def update_learning(
    *,
    load_id: str,
    policy: LearningPolicy,
    state: LearningState,
    sample: LearningSample,
) -> LearningUpdate:
    """Validate a sample, maintain bounded state, and return a new estimate."""

    if state.frozen:
        return LearningUpdate(
            state, estimate_for(load_id, policy, state), False, (ReasonCode.LEARNING_FROZEN,)
        )
    if state.samples and sample.observed_at <= state.samples[-1].observed_at:
        return LearningUpdate(
            state, estimate_for(load_id, policy, state), False, (ReasonCode.INPUT_STALE,)
        )
    if (
        not sample.feedback_valid
        or not _within_absolute_bounds(sample, policy)
        or _is_relative_outlier(sample, state, policy)
    ):
        return LearningUpdate(
            state, estimate_for(load_id, policy, state), False, (ReasonCode.LEARNING_OUTLIER,)
        )
    samples = (state.samples + (sample,))[-policy.window_size :]
    power_ewma = _ewma(state.ewma_power_w, sample.power_w, policy.ewma_alpha)
    duration_ewma = _ewma(state.ewma_duration_s, sample.duration_s, policy.ewma_alpha)
    new_state = LearningState(
        samples=samples,
        ewma_power_w=_clamp(power_ewma, policy.minimum_power_w, policy.maximum_power_w),
        ewma_duration_s=_clamp(duration_ewma, policy.minimum_duration_s, policy.maximum_duration_s),
        frozen=False,
    )
    return LearningUpdate(
        new_state, estimate_for(load_id, policy, new_state), True, (ReasonCode.PLAN_SELECTED,)
    )


def estimate_for(load_id: str, policy: LearningPolicy, state: LearningState) -> LearningEstimate:
    """Return configured estimates until confidence is sufficient, then bounded learning."""

    count = len(state.samples)
    confidence = min(1.0, count / policy.min_samples)
    if count < policy.min_samples or state.ewma_power_w is None or state.ewma_duration_s is None:
        return LearningEstimate(
            load_id=load_id,
            expected_power_w=_clamp(
                policy.configured_power_w, policy.minimum_power_w, policy.maximum_power_w
            ),
            expected_duration_s=_clamp(
                policy.configured_duration_s, policy.minimum_duration_s, policy.maximum_duration_s
            ),
            confidence=confidence,
            sample_count=count,
            source="configured",
        )
    median_power = median(sample.power_w for sample in state.samples)
    median_duration = median(sample.duration_s for sample in state.samples)
    # Use the larger of median and EWMA: an underestimate is more dangerous to
    # deadline/capacity planning than a conservative overestimate.
    return LearningEstimate(
        load_id=load_id,
        expected_power_w=_clamp(
            max(median_power, state.ewma_power_w), policy.minimum_power_w, policy.maximum_power_w
        ),
        expected_duration_s=_clamp(
            max(median_duration, state.ewma_duration_s),
            policy.minimum_duration_s,
            policy.maximum_duration_s,
        ),
        confidence=confidence,
        sample_count=count,
        source="learned",
    )


def set_learning_frozen(state: LearningState, frozen: bool) -> LearningState:
    return LearningState(
        samples=state.samples,
        ewma_power_w=state.ewma_power_w,
        ewma_duration_s=state.ewma_duration_s,
        frozen=frozen,
    )


def reset_learning(*, frozen: bool = False) -> LearningState:
    return LearningState(frozen=frozen)


def _within_absolute_bounds(sample: LearningSample, policy: LearningPolicy) -> bool:
    return (
        policy.minimum_power_w <= sample.power_w <= policy.maximum_power_w
        and policy.minimum_duration_s <= sample.duration_s <= policy.maximum_duration_s
    )


def _is_relative_outlier(
    sample: LearningSample, state: LearningState, policy: LearningPolicy
) -> bool:
    if len(state.samples) < 3:
        return False
    median_power = median(item.power_w for item in state.samples)
    median_duration = median(item.duration_s for item in state.samples)
    return _outside_ratio(sample.power_w, median_power, policy.outlier_ratio) or _outside_ratio(
        sample.duration_s,
        median_duration,
        policy.outlier_ratio,
    )


def _outside_ratio(value: float, centre: float, ratio: float) -> bool:
    if centre == 0:
        return value != 0
    return value > centre * ratio or value < centre / ratio


def _ewma(previous: float | None, sample: float, alpha: float) -> float:
    return sample if previous is None else alpha * sample + (1 - alpha) * previous


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))
