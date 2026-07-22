"""Decimal tariff and total-increasing accounting tests."""

from __future__ import annotations

import unittest
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from custom_components.intelligent_load_controller.controller.accounting import (
    AccountingInterval,
    EnergyProvenance,
    RuntimeAccounting,
    record_interval,
)
from custom_components.intelligent_load_controller.controller.tariff import (
    PriceInterval,
    PriceUnit,
    normalize_price,
    split_interval_cost,
)

NOW = datetime(2026, 7, 1, tzinfo=UTC)


class TariffAndAccountingTests(unittest.TestCase):
    def test_price_normalisation_and_solar_opportunity_cost(self) -> None:
        self.assertEqual(normalize_price("25", PriceUnit.CENTS_PER_KWH), Decimal("0.25"))
        tariff = PriceInterval(NOW, NOW + timedelta(hours=1), Decimal("0.30"), Decimal("0.10"))
        cost = split_interval_cost(power_w=1_000, duration_s=3600, tariff=tariff, solar_power_w=500)
        self.assertEqual(cost.grid_energy_wh, 500)
        self.assertEqual(cost.solar_energy_wh, 500)
        self.assertEqual(cost.cost, Decimal("0.20"))

    def test_accounting_is_monotonic_and_preserves_provenance(self) -> None:
        tariff = PriceInterval(NOW, NOW + timedelta(hours=1), Decimal("0.30"), Decimal("0.10"))
        interval = AccountingInterval(
            NOW,
            NOW + timedelta(hours=1),
            commanded_power_w=1_000,
            confirmed_power_w=800,
            provenance=EnergyProvenance(grid_wh=500, solar_wh=300),
            command_started=True,
        )
        accounting = record_interval(RuntimeAccounting(), interval, tariff=tariff)
        self.assertEqual(accounting.commanded_energy_wh, 1_000)
        self.assertEqual(accounting.confirmed_energy_wh, 800)
        self.assertEqual(accounting.attributed_energy_wh, 800)
        self.assertEqual(accounting.controlled_cost, Decimal("0.18"))
        self.assertEqual(accounting.starts, 1)
        with self.assertRaises(ValueError):
            record_interval(accounting, interval, tariff=tariff)
