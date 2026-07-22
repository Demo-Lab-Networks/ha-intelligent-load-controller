"""Deterministic simulation/report regression tests."""

from __future__ import annotations

import json
import unittest
from datetime import UTC, datetime, timedelta

from custom_components.intelligent_load_controller.controller.models import (
    LoadRequest,
    SiteConfigV1,
)
from custom_components.intelligent_load_controller.controller.simulation import (
    SimulationScenario,
    default_scenarios,
    run_scenario,
)

START = datetime(2026, 7, 1, tzinfo=UTC)


class SimulationTests(unittest.TestCase):
    def test_short_scenario_is_reproducible_and_emits_all_report_formats(self) -> None:
        scenario = SimulationScenario(
            scenario_id="short",
            seed=42,
            start_at=START,
            site=SiteConfigV1("sim", "UTC", "AUD", 4_000, start_stagger_s=0),
            requests=(
                LoadRequest(
                    "load", 1_000, remaining_runtime_s=1_800, deadline_at=START + timedelta(hours=1)
                ),
            ),
            duration_s=3_600,
            base_import_w=1_000,
            solar_peak_w=2_000,
            input_unavailable_slots=frozenset({3}),
        )
        first = run_scenario(scenario)
        second = run_scenario(scenario)
        self.assertEqual(first, second)
        self.assertTrue(first.passed)
        self.assertEqual(len(first.slots), 12)
        self.assertEqual(first.slots[3].granted_w, 0)
        parsed = json.loads(first.to_json())
        self.assertTrue(parsed["passed"])
        self.assertEqual(parsed["seed"], 42)
        self.assertIn("Simulation: short", first.to_markdown())
        self.assertEqual(len(first.to_csv().splitlines()), 13)

    def test_seeded_twenty_load_scenario_preserves_safety_invariants(self) -> None:
        scenario = default_scenarios(seed=123)[-1]
        report = run_scenario(scenario)
        self.assertEqual(len(scenario.requests), 20)
        self.assertTrue(report.passed)
        self.assertEqual(len(report.slots), 288)
        for slot in report.slots:
            self.assertLessEqual(slot.solar_allocated_w, slot.solar_w + 1e-6)
