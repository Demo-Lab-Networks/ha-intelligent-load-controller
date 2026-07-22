"""Seeded property-style safety checks without third-party test dependencies."""

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
    SiteConfigV1,
    SitePowerSnapshot,
)
from custom_components.intelligent_load_controller.controller.planner import (
    DeterministicPlanner,
    PlannerSettings,
    PlanningInput,
)
from custom_components.intelligent_load_controller.controller.tariff import (
    PriceInterval,
    TariffTimeline,
)

START = datetime(2026, 7, 1, tzinfo=UTC)


class InvariantPropertyTests(unittest.TestCase):
    def test_seeded_planner_cases_are_repeatable_and_capacity_safe(self) -> None:
        random_source = random.Random(90210)
        settings = PlannerSettings(slot_seconds=300, horizon_seconds=3_600)
        planner = DeterministicPlanner(settings)
        for case in range(60):
            hard_limit = random_source.randint(500, 8_000)
            controlled_limit = random_source.choice((None, random_source.randint(0, hard_limit)))
            site = SiteConfigV1(
                f"site-{case}",
                "UTC",
                "AUD",
                hard_limit,
                controlled_import_limit_w=controlled_limit,
            )
            forecasts = tuple(
                ForecastPoint(
                    at=START + timedelta(seconds=index * 300),
                    base_import_w=random_source.randint(0, hard_limit + 1_000),
                    solar_generation_w=random_source.randint(0, 4_000),
                    valid_until_at=START + timedelta(seconds=(index + 1) * 300),
                )
                for index in range(settings.slot_count)
            )
            tariffs = TariffTimeline(
                tuple(
                    PriceInterval(
                        START + timedelta(seconds=index * 300),
                        START + timedelta(seconds=(index + 1) * 300),
                        Decimal(str(random_source.randint(-10, 70) / 100)),
                        Decimal("0.08"),
                    )
                    for index in range(settings.slot_count)
                )
            )
            requests = tuple(
                LoadRequest(
                    load_id=f"load-{index}",
                    requested_power_w=random_source.randint(100, 3_000),
                    remaining_runtime_s=random_source.choice((300, 600, 900, 1_200)),
                    deadline_at=START
                    + timedelta(seconds=random_source.choice((900, 1_800, 3_600))),
                    priority=random_source.randint(0, 100),
                    mandatory=random_source.choice((False, True)),
                )
                for index in range(random_source.randint(1, 7))
            )
            planning = PlanningInput(START, site, requests, tariffs, forecasts)
            first = planner.plan(planning)
            second = planner.plan(planning)
            self.assertEqual(first, second)
            self.assertEqual(len(first.slots), settings.slot_count)
            for slot in first.slots:
                self.assertGreaterEqual(slot.capacity_w, 0)
                self.assertLessEqual(slot.allocated_w, slot.capacity_w + 1e-6)
                self.assertLessEqual(slot.solar_allocated_w, slot.allocated_w + 1e-6)
            for interval in first.intervals:
                self.assertGreater(interval.end_at, interval.start_at)
                self.assertGreaterEqual(interval.start_at, START)
                self.assertLessEqual(interval.end_at, START + timedelta(hours=1))

    def test_seeded_arbitrator_cases_never_grant_beyond_hard_capacity(self) -> None:
        random_source = random.Random(7331)
        arbitrator = SiteArbitrator()
        for case in range(100):
            hard_limit = random_source.randint(500, 10_000)
            baseline = random_source.randint(0, hard_limit + 1_000)
            solar = random_source.randint(0, 5_000)
            automatic_enabled = random_source.choice((False, True))
            input_available = random_source.choice((False, True, True, True))
            site = SiteConfigV1(
                f"site-{case}",
                "UTC",
                "AUD",
                hard_limit,
                controlled_import_limit_w=random_source.choice(
                    (None, random_source.randint(0, hard_limit))
                ),
                phase_hard_limits_w={"L1": random_source.randint(100, hard_limit)},
                start_stagger_s=0,
            )
            requests = tuple(
                LoadRequest(
                    load_id=f"load-{index}",
                    requested_power_w=random_source.randint(50, 3_000),
                    priority=random_source.randint(0, 100),
                    phase=random_source.choice((None, "L1")),
                    control_source=random_source.choice(
                        (CommandSource.AUTOMATIC, CommandSource.MANUAL)
                    ),
                    minimum_power_w=random_source.choice((None, 0)),
                    maximum_power_w=None,
                )
                for index in range(random_source.randint(1, 10))
            )
            snapshot = SitePowerSnapshot(
                START,
                grid_import_w=baseline,
                solar_generation_w=solar,
                phase_import_w={"L1": random_source.randint(-500, hard_limit)},
                available=input_available,
            )
            result = arbitrator.arbitrate(
                ArbitrationInput(
                    START,
                    site,
                    snapshot,
                    requests,
                    automatic_enabled=automatic_enabled,
                    uncontrolled_import_w=baseline,
                    available_solar_w=solar,
                )
            )
            hard_capacity = max(0, hard_limit - baseline + solar)
            self.assertLessEqual(result.total_granted_w, hard_capacity + 1e-6)
            self.assertLessEqual(result.total_solar_allocated_w, solar + 1e-6)
            for allocation in result.allocations:
                self.assertLessEqual(allocation.granted_w, allocation.requested_w + 1e-6)
                if not input_available:
                    self.assertEqual(allocation.granted_w, 0)
            if not automatic_enabled:
                automatic_ids = {
                    request.load_id
                    for request in requests
                    if request.control_source is CommandSource.AUTOMATIC
                }
                self.assertTrue(
                    all(
                        allocation.granted_w == 0
                        for allocation in result.allocations
                        if allocation.load_id in automatic_ids
                    )
                )
