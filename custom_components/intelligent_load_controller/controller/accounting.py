"""Immutable runtime, energy-provenance and controlled-cost accounting."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from math import isfinite

from .models import EnergySource, Money, as_decimal, as_utc
from .tariff import PriceInterval, cost_for_energy


@dataclass(frozen=True, slots=True)
class EnergyProvenance:
    """Normalised energy attribution for a measured/estimated interval."""

    grid_wh: float = 0.0
    solar_wh: float = 0.0
    battery_wh: float = 0.0
    unknown_wh: float = 0.0

    def __post_init__(self) -> None:
        for field_name in ("grid_wh", "solar_wh", "battery_wh", "unknown_wh"):
            value = float(getattr(self, field_name))
            if not isfinite(value) or value < 0:
                raise ValueError(f"{field_name} must be a finite non-negative number")
            object.__setattr__(self, field_name, value)

    @property
    def total_wh(self) -> float:
        return self.grid_wh + self.solar_wh + self.battery_wh + self.unknown_wh


@dataclass(frozen=True, slots=True)
class AccountingInterval:
    """An observed interval. ``None`` is different from a measured zero."""

    start_at: datetime
    end_at: datetime
    commanded_power_w: float = 0.0
    confirmed_power_w: float | None = None
    estimated_power_w: float | None = None
    provenance: EnergyProvenance = EnergyProvenance()
    blocked: bool = False
    command_started: bool = False
    setpoint_changed: bool = False
    shortfall_wh: float = 0.0

    def __post_init__(self) -> None:
        start = as_utc(self.start_at, field_name="start_at")
        end = as_utc(self.end_at, field_name="end_at")
        if end <= start:
            raise ValueError("end_at must be after start_at")
        object.__setattr__(self, "start_at", start)
        object.__setattr__(self, "end_at", end)
        for field_name in (
            "commanded_power_w",
            "confirmed_power_w",
            "estimated_power_w",
            "shortfall_wh",
        ):
            value = getattr(self, field_name)
            if value is not None:
                checked = float(value)
                if not isfinite(checked) or checked < 0:
                    raise ValueError(f"{field_name} must be a finite non-negative number")
                object.__setattr__(self, field_name, checked)

    @property
    def duration_s(self) -> float:
        return (self.end_at - self.start_at).total_seconds()


@dataclass(frozen=True, slots=True)
class RuntimeAccounting:
    """Monotonic counters persisted as bounded recovery/accounting state."""

    accounted_through_at: datetime | None = None
    commanded_runtime_s: float = 0.0
    confirmed_runtime_s: float = 0.0
    estimated_runtime_s: float = 0.0
    commanded_energy_wh: float = 0.0
    confirmed_energy_wh: float = 0.0
    estimated_energy_wh: float = 0.0
    grid_energy_wh: float = 0.0
    solar_energy_wh: float = 0.0
    battery_energy_wh: float = 0.0
    unknown_energy_wh: float = 0.0
    controlled_cost: Money = Decimal("0")
    blocked_s: float = 0.0
    starts: int = 0
    setpoint_changes: int = 0
    shortfall_wh: float = 0.0

    def __post_init__(self) -> None:
        if self.accounted_through_at is not None:
            object.__setattr__(
                self,
                "accounted_through_at",
                as_utc(self.accounted_through_at, field_name="accounted_through_at"),
            )
        for field_name in (
            "commanded_runtime_s",
            "confirmed_runtime_s",
            "estimated_runtime_s",
            "commanded_energy_wh",
            "confirmed_energy_wh",
            "estimated_energy_wh",
            "grid_energy_wh",
            "solar_energy_wh",
            "battery_energy_wh",
            "unknown_energy_wh",
            "blocked_s",
            "shortfall_wh",
        ):
            value = float(getattr(self, field_name))
            if not isfinite(value) or value < 0:
                raise ValueError(f"{field_name} must be a finite non-negative number")
            object.__setattr__(self, field_name, value)
        if self.starts < 0 or self.setpoint_changes < 0:
            raise ValueError("event counters must not be negative")
        object.__setattr__(
            self, "controlled_cost", as_decimal(self.controlled_cost, field_name="controlled_cost")
        )

    @property
    def attributed_energy_wh(self) -> float:
        return (
            self.grid_energy_wh
            + self.solar_energy_wh
            + self.battery_energy_wh
            + self.unknown_energy_wh
        )


def record_interval(
    accounting: RuntimeAccounting,
    interval: AccountingInterval,
    *,
    tariff: PriceInterval | None = None,
) -> RuntimeAccounting:
    """Return accounting advanced by exactly one non-overlapping interval.

    Callers must not pass overlapping intervals.  Rejecting them rather than
    silently summing protects Energy-dashboard-compatible total-increasing
    counters from double counting.
    """

    if (
        accounting.accounted_through_at is not None
        and interval.start_at < accounting.accounted_through_at
    ):
        raise ValueError("accounting intervals must not overlap or move backwards")
    duration_s = interval.duration_s
    commanded_energy = _energy_wh(interval.commanded_power_w, duration_s)
    confirmed_energy = (
        _energy_wh(interval.confirmed_power_w, duration_s)
        if interval.confirmed_power_w is not None
        else 0.0
    )
    estimated_energy = (
        _energy_wh(interval.estimated_power_w, duration_s)
        if interval.estimated_power_w is not None
        else 0.0
    )
    provenance_cost = _provenance_cost(interval.provenance, tariff)
    return RuntimeAccounting(
        accounted_through_at=interval.end_at,
        commanded_runtime_s=accounting.commanded_runtime_s
        + (duration_s if interval.commanded_power_w > 0 else 0.0),
        confirmed_runtime_s=accounting.confirmed_runtime_s
        + (duration_s if (interval.confirmed_power_w or 0.0) > 0 else 0.0),
        estimated_runtime_s=accounting.estimated_runtime_s
        + (duration_s if (interval.estimated_power_w or 0.0) > 0 else 0.0),
        commanded_energy_wh=accounting.commanded_energy_wh + commanded_energy,
        confirmed_energy_wh=accounting.confirmed_energy_wh + confirmed_energy,
        estimated_energy_wh=accounting.estimated_energy_wh + estimated_energy,
        grid_energy_wh=accounting.grid_energy_wh + interval.provenance.grid_wh,
        solar_energy_wh=accounting.solar_energy_wh + interval.provenance.solar_wh,
        battery_energy_wh=accounting.battery_energy_wh + interval.provenance.battery_wh,
        unknown_energy_wh=accounting.unknown_energy_wh + interval.provenance.unknown_wh,
        controlled_cost=accounting.controlled_cost + provenance_cost,
        blocked_s=accounting.blocked_s + (duration_s if interval.blocked else 0.0),
        starts=accounting.starts + int(interval.command_started),
        setpoint_changes=accounting.setpoint_changes + int(interval.setpoint_changed),
        shortfall_wh=accounting.shortfall_wh + interval.shortfall_wh,
    )


def reset_daily_accounting(accounting: RuntimeAccounting) -> RuntimeAccounting:
    """Return a fresh daily counter set while retaining no historical values."""

    return RuntimeAccounting(accounted_through_at=accounting.accounted_through_at)


def _energy_wh(power_w: float | None, duration_s: float) -> float:
    return 0.0 if power_w is None else power_w * duration_s / 3600


def _provenance_cost(provenance: EnergyProvenance, tariff: PriceInterval | None) -> Money:
    if tariff is None:
        return Decimal("0")
    return (
        cost_for_energy(provenance.grid_wh, tariff.marginal_rate(EnergySource.GRID))
        + cost_for_energy(provenance.solar_wh, tariff.marginal_rate(EnergySource.SOLAR))
        + cost_for_energy(provenance.battery_wh, tariff.marginal_rate(EnergySource.BATTERY))
        # Unknown energy is costed conservatively as import, which avoids
        # overstating savings until a trustworthy provenance signal exists.
        + cost_for_energy(provenance.unknown_wh, tariff.marginal_rate(EnergySource.UNKNOWN))
    )
