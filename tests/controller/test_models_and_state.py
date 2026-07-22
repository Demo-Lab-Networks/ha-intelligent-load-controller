"""Safety and immutability tests for core model/state APIs."""

from __future__ import annotations

import unittest
from dataclasses import FrozenInstanceError
from datetime import UTC, datetime

from custom_components.intelligent_load_controller.controller.models import (
    CommandAction,
    CommandProposal,
    CommandSource,
    LoadRequest,
    ReasonCode,
    SiteConfigV1,
    SitePowerSnapshot,
)
from custom_components.intelligent_load_controller.controller.state import (
    authorize_command,
    derive_load_state,
)

NOW = datetime(2026, 7, 1, 0, 0, tzinfo=UTC)


class ModelAndStateTests(unittest.TestCase):
    def test_config_is_immutable_and_normalised(self) -> None:
        site = SiteConfigV1(
            site_id="main",
            timezone="Australia/Brisbane",
            currency="aud",
            hard_import_limit_w=5_000,
            phase_hard_limits_w={"L1": 2_000},
        )
        self.assertEqual(site.phase_hard_limit_w("L1"), 2_000)
        with self.assertRaises(FrozenInstanceError):
            site.hard_import_limit_w = 1  # type: ignore[misc]

    def test_required_slot_count_covers_energy_and_runtime(self) -> None:
        request = LoadRequest(
            load_id="heater",
            requested_power_w=1_000,
            remaining_energy_wh=1_000,
            remaining_runtime_s=301,
        )
        self.assertEqual(request.required_slot_count(300), 12)

    def test_snapshot_preserves_signed_phase_export(self) -> None:
        snapshot = SitePowerSnapshot(NOW, grid_import_w=-250, phase_import_w={"L1": -100, "L2": 50})
        self.assertEqual(snapshot.phase_import("L1"), -100)

    def test_automatic_disabled_and_preview_never_authorise_command(self) -> None:
        proposal = CommandProposal("load", CommandAction.START, CommandSource.AUTOMATIC)
        disabled = authorize_command(
            proposal,
            automatic_enabled=False,
            observation_ready=True,
            hard_safety_ok=True,
        )
        preview = authorize_command(
            proposal,
            automatic_enabled=True,
            observation_ready=True,
            hard_safety_ok=True,
            preview=True,
        )
        self.assertFalse(disabled.allowed)
        self.assertEqual(disabled.reasons, (ReasonCode.AUTOMATIC_DISABLED,))
        self.assertFalse(preview.allowed)
        self.assertEqual(preview.reasons, (ReasonCode.PREVIEW,))

    def test_state_reports_disabled_without_implying_a_stop(self) -> None:
        decision = derive_load_state(
            at=NOW,
            automatic_enabled=False,
            observation_ready=True,
            is_running=False,
        )
        self.assertEqual(decision.reasons, (ReasonCode.AUTOMATIC_DISABLED,))
