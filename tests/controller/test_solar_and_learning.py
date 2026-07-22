"""Solar hysteresis and bounded-learning tests."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime, timedelta

from custom_components.intelligent_load_controller.controller.learning import (
    LearningPolicy,
    LearningSample,
    LearningState,
    set_learning_frozen,
    update_learning,
)
from custom_components.intelligent_load_controller.controller.models import ReasonCode
from custom_components.intelligent_load_controller.controller.solar import (
    SolarAction,
    SolarPolicy,
    SolarQualificationState,
    evaluate_solar,
)

NOW = datetime(2026, 7, 1, tzinfo=UTC)


class SolarAndLearningTests(unittest.TestCase):
    def test_solar_requires_qualification_and_respects_stop_hold(self) -> None:
        policy = SolarPolicy(
            start_threshold_w=1_000,
            stop_threshold_w=700,
            start_qualification_s=300,
            stop_qualification_s=300,
        )
        first = evaluate_solar(at=NOW, available_solar_w=1_100, is_running=False, policy=policy)
        self.assertEqual(first.action, SolarAction.NONE)
        started = evaluate_solar(
            at=NOW + timedelta(seconds=300),
            available_solar_w=1_100,
            is_running=False,
            policy=policy,
            state=first.state,
        )
        self.assertEqual(started.action, SolarAction.START)
        falling = evaluate_solar(
            at=NOW + timedelta(seconds=400),
            available_solar_w=600,
            is_running=True,
            policy=policy,
            state=started.state,
        )
        self.assertEqual(falling.action, SolarAction.NONE)
        stopped = evaluate_solar(
            at=NOW + timedelta(seconds=700),
            available_solar_w=600,
            is_running=True,
            policy=policy,
            state=falling.state,
        )
        self.assertEqual(stopped.action, SolarAction.STOP)

    def test_learning_is_bounded_rejects_outliers_and_can_freeze(self) -> None:
        policy = LearningPolicy(
            1_000, 3_600, 500, 1_500, 1_000, 8_000, min_samples=3, outlier_ratio=1.2
        )
        state = LearningState()
        for index, power in enumerate((900, 1_000, 1_100)):
            update = update_learning(
                load_id="load",
                policy=policy,
                state=state,
                sample=LearningSample(NOW + timedelta(hours=index), power, 4_000),
            )
            state = update.state
        self.assertEqual(update.estimate.source, "learned")
        outlier = update_learning(
            load_id="load",
            policy=policy,
            state=state,
            sample=LearningSample(NOW + timedelta(hours=4), 1_500, 8_000),
        )
        self.assertFalse(outlier.accepted)
        self.assertEqual(outlier.reasons, (ReasonCode.LEARNING_OUTLIER,))
        frozen = set_learning_frozen(state, True)
        blocked = update_learning(
            load_id="load",
            policy=policy,
            state=frozen,
            sample=LearningSample(NOW + timedelta(hours=5), 1_000, 4_000),
        )
        self.assertFalse(blocked.accepted)
        self.assertEqual(blocked.reasons, (ReasonCode.LEARNING_FROZEN,))

        stale = update_learning(
            load_id="load",
            policy=policy,
            state=state,
            sample=LearningSample(NOW, 1_000, 4_000),
        )
        self.assertFalse(stale.accepted)
        self.assertEqual(stale.reasons, (ReasonCode.INPUT_STALE,))

    def test_solar_daily_start_cap_uses_bounded_persisted_history(self) -> None:
        policy = SolarPolicy(start_threshold_w=1_000, stop_threshold_w=700, max_starts_per_day=2)
        state = SolarQualificationState()
        for offset in (0, 2):
            start = evaluate_solar(
                at=NOW + timedelta(hours=offset),
                available_solar_w=1_100,
                is_running=False,
                policy=policy,
                state=state,
            )
            self.assertEqual(start.action, SolarAction.START)
            stop = evaluate_solar(
                at=NOW + timedelta(hours=offset, minutes=1),
                available_solar_w=0,
                is_running=True,
                policy=policy,
                state=start.state,
            )
            self.assertEqual(stop.action, SolarAction.STOP)
            state = stop.state
        capped = evaluate_solar(
            at=NOW + timedelta(hours=4),
            available_solar_w=1_100,
            is_running=False,
            policy=policy,
            state=state,
        )
        self.assertEqual(capped.action, SolarAction.NONE)
        self.assertEqual(capped.reasons, (ReasonCode.EQUIPMENT_LIMIT,))
