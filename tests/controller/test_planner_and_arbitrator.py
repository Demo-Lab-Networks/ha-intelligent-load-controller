"""Determinism and hard-cap safety tests for the planning/allocation core."""

from __future__ import annotations

import random
import unittest
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from custom_components.intelligent_load_controller.controller.arbitrator import (
    ArbitrationInput,
    SiteArbitrator,
)
from custom_components.intelligent_load_controller.controller.models import (
    CommandSource,
    ForecastPoint,
    LoadRequest,
    ReasonCode,
    SiteConfigV1,
    SitePowerSnapshot,
)
from custom_components.intelligent_load_controller.controller.planner import (
    DeterministicPlanner,
    PlanningInput,
)
from custom_components.intelligent_load_controller.controller.tariff import (
    PriceInterval,
    TariffTimeline,
)

NOW = datetime(2026, 7, 1, 0, 0, tzinfo=UTC)


class PlannerAndArbitratorTests(unittest.TestCase):
    def test_planner_is_deterministic_prefers_cheaper_slot_and_never_overallocates(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 1_000)
        timeline = TariffTimeline(
            (
                PriceInterval(NOW, NOW + timedelta(minutes=5), Decimal("0.50")),
                PriceInterval(NOW + timedelta(minutes=5), NOW + timedelta(days=2), Decimal("0.10")),
            )
        )
        request = LoadRequest("load", 1_000, remaining_runtime_s=300)
        input_value = PlanningInput(NOW, site, (request,), timeline)
        first = DeterministicPlanner().plan(input_value)
        second = DeterministicPlanner().plan(input_value)
        self.assertEqual(first, second)
        self.assertEqual(first.intervals[0].start_at, NOW + timedelta(minutes=5))
        self.assertTrue(all(slot.allocated_w <= slot.capacity_w for slot in first.slots))

    def test_planner_marks_impossible_deadline_without_breaching_capacity(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 1_000)
        tariff = TariffTimeline((PriceInterval(NOW, NOW + timedelta(days=2), Decimal("0.20")),))
        high = LoadRequest(
            "high",
            1_000,
            remaining_runtime_s=600,
            deadline_at=NOW + timedelta(minutes=10),
            priority=10,
        )
        low = LoadRequest(
            "low", 1_000, remaining_runtime_s=600, deadline_at=NOW + timedelta(minutes=10)
        )
        plan = DeterministicPlanner().plan(PlanningInput(NOW, site, (low, high), tariff))
        results = {result.load_id: result for result in plan.loads}
        self.assertEqual(results["high"].unmet_slots, 0)
        self.assertGreater(results["low"].unmet_slots, 0)
        self.assertIn(ReasonCode.DEADLINE_IMPOSSIBLE, results["low"].reasons)
        self.assertTrue(all(slot.allocated_w <= 1_000 for slot in plan.slots))

    def test_planner_does_not_carry_an_unbounded_forecast_forward(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 1_000)
        tariff = TariffTimeline((PriceInterval(NOW, NOW + timedelta(days=2), Decimal("0.20")),))
        request = LoadRequest(
            "load", 1_500, remaining_runtime_s=300, deadline_at=NOW + timedelta(minutes=10)
        )
        one_slot_solar = ForecastPoint(NOW, solar_generation_w=1_000)
        plan = DeterministicPlanner().plan(
            PlanningInput(NOW, site, (request,), tariff, (one_slot_solar,))
        )
        self.assertEqual(plan.loads[0].unmet_slots, 0)
        self.assertEqual(plan.intervals[0].start_at, NOW)
        self.assertEqual(plan.intervals[0].solar_allocated_w, 1_000)
        self.assertTrue(all(slot.capacity_w <= 1_000 for slot in plan.slots[1:]))

    def test_optional_unpriced_request_is_rejected_with_a_price_warning(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 1_000)
        request = LoadRequest("load", 1_000, remaining_runtime_s=300)
        plan = DeterministicPlanner().plan(PlanningInput(NOW, site, (request,)))
        result = plan.loads[0]
        self.assertEqual(result.unmet_slots, 1)
        self.assertIn(ReasonCode.TARIFF_UNAVAILABLE, result.reasons)
        self.assertIn(ReasonCode.TARIFF_UNAVAILABLE, plan.warnings)

    def test_duplicate_forecasts_are_rejected_to_keep_planning_deterministic(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 1_000)
        forecast = ForecastPoint(NOW, solar_generation_w=500)
        with self.assertRaises(ValueError):
            PlanningInput(NOW, site, (), forecasts=(forecast, forecast))

    def test_arbitrator_suppresses_automatic_and_allocates_solar_once(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 2_000)
        snapshot = SitePowerSnapshot(NOW, grid_import_w=1_000, solar_generation_w=1_000)
        automatic = LoadRequest("automatic", 500)
        disabled = SiteArbitrator().arbitrate(
            ArbitrationInput(NOW, site, snapshot, (automatic,), automatic_enabled=False)
        )
        self.assertEqual(disabled.allocations[0].reasons, (ReasonCode.AUTOMATIC_DISABLED,))

        requests = (LoadRequest("a", 1_000), LoadRequest("b", 1_000))
        result = SiteArbitrator().arbitrate(ArbitrationInput(NOW, site, snapshot, requests))
        self.assertEqual(result.total_granted_w, 2_000)
        self.assertEqual(result.total_solar_allocated_w, 1_000)
        self.assertLessEqual(result.total_solar_allocated_w, result.available_solar_w)

    def test_manual_never_crosses_hard_limit_and_phase_limit_is_enforced(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 1_000, phase_hard_limits_w={"L1": 500})
        snapshot = SitePowerSnapshot(NOW, grid_import_w=0, phase_import_w={"L1": 0})
        manual = LoadRequest("manual", 800, control_source=CommandSource.MANUAL)
        automatic = LoadRequest("automatic", 800)
        result = SiteArbitrator().arbitrate(
            ArbitrationInput(NOW, site, snapshot, (automatic, manual))
        )
        allocations = {allocation.load_id: allocation for allocation in result.allocations}
        self.assertTrue(allocations["manual"].accepted)
        self.assertFalse(allocations["automatic"].accepted)
        phase = SiteArbitrator().arbitrate(
            ArbitrationInput(NOW, site, snapshot, (LoadRequest("phase", 800, phase="L1"),))
        )
        self.assertEqual(phase.allocations[0].reasons, (ReasonCode.PHASE_LIMIT,))

    def test_snapshot_age_is_derived_from_observation_timestamp(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 2_000)
        stale_snapshot = SitePowerSnapshot(NOW, grid_import_w=0)
        result = SiteArbitrator().arbitrate(
            ArbitrationInput(
                NOW + timedelta(seconds=121),
                site,
                stale_snapshot,
                (LoadRequest("load", 500),),
                max_input_age_s=120,
            )
        )
        self.assertEqual(result.allocations[0].reasons, (ReasonCode.INPUT_STALE,))

    def test_start_stagger_applies_between_starts_in_one_arbitration(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 3_000, start_stagger_s=30)
        snapshot = SitePowerSnapshot(NOW, grid_import_w=0)
        result = SiteArbitrator().arbitrate(
            ArbitrationInput(NOW, site, snapshot, (LoadRequest("a", 500), LoadRequest("b", 500)))
        )
        allocations = {allocation.load_id: allocation for allocation in result.allocations}
        self.assertTrue(allocations["a"].accepted)
        self.assertEqual(allocations["b"].reasons, (ReasonCode.START_STAGGER,))

    def test_binary_load_cap_is_a_hard_limit_for_manual_and_automatic_requests(self) -> None:
        site = SiteConfigV1("site", "UTC", "AUD", 5_000, max_simultaneous_binary_loads=1)
        snapshot = SitePowerSnapshot(NOW, grid_import_w=0)
        result = SiteArbitrator().arbitrate(
            ArbitrationInput(
                NOW,
                site,
                snapshot,
                (
                    LoadRequest("manual", 500, control_source=CommandSource.MANUAL),
                    LoadRequest("automatic", 500),
                ),
            )
        )
        allocations = {allocation.load_id: allocation for allocation in result.allocations}
        self.assertTrue(allocations["manual"].accepted)
        self.assertEqual(
            allocations["automatic"].reasons,
            (ReasonCode.MAX_SIMULTANEOUS_BINARY_LOADS,),
        )
        with_existing = SiteArbitrator().arbitrate(
            ArbitrationInput(
                NOW,
                site,
                snapshot,
                (LoadRequest("new", 500),),
                existing_binary_load_count=1,
            )
        )
        self.assertEqual(
            with_existing.allocations[0].reasons,
            (ReasonCode.MAX_SIMULTANEOUS_BINARY_LOADS,),
        )

    def test_seeded_safety_simulation_never_breaches_capacity_or_duplicates_solar(self) -> None:
        random_source = random.Random(4815162342)
        arbitrator = SiteArbitrator()
        for scenario in range(40):
            hard_limit = random_source.randint(1_000, 10_000)
            baseline = random_source.randint(0, hard_limit)
            solar = random_source.randint(0, 4_000)
            site = SiteConfigV1(f"site-{scenario}", "UTC", "AUD", hard_limit)
            snapshot = SitePowerSnapshot(NOW, grid_import_w=baseline, solar_generation_w=solar)
            requests = tuple(
                LoadRequest(
                    f"load-{index}",
                    random_source.randint(100, 3_000),
                    priority=random_source.randint(0, 100),
                )
                for index in range(12)
            )
            result = arbitrator.arbitrate(ArbitrationInput(NOW, site, snapshot, requests))
            self.assertLessEqual(result.total_granted_w, hard_limit - baseline + solar + 1e-6)
            self.assertLessEqual(result.total_solar_allocated_w, solar + 1e-6)
