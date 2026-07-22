"""Price normalisation and marginal-cost primitives.

Prices are deliberately represented as :class:`~decimal.Decimal` local
currency/kWh.  This avoids float rounding changing a deterministic plan and
makes the difference between grid import and forgone solar export explicit.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from enum import Enum
from math import isfinite

from .models import EnergySource, Money, as_decimal, as_utc


class PriceUnit(str, Enum):
    CURRENCY_PER_KWH = "currency_per_kwh"
    CENTS_PER_KWH = "cents_per_kwh"
    CURRENCY_PER_MWH = "currency_per_mwh"
    CURRENCY_PER_WH = "currency_per_wh"


def normalize_price(value: Decimal | int | float | str, unit: PriceUnit | str) -> Money:
    """Normalise a configured tariff to local currency per kWh."""

    try:
        parsed_unit = unit if isinstance(unit, PriceUnit) else PriceUnit(unit)
    except ValueError as err:
        raise ValueError(f"unsupported price unit {unit!r}") from err
    price = as_decimal(value, field_name="price")
    if parsed_unit is PriceUnit.CURRENCY_PER_KWH:
        return price
    if parsed_unit is PriceUnit.CENTS_PER_KWH:
        return price / Decimal(100)
    if parsed_unit is PriceUnit.CURRENCY_PER_MWH:
        return price / Decimal(1000)
    if parsed_unit is PriceUnit.CURRENCY_PER_WH:
        return price * Decimal(1000)
    raise AssertionError("all PriceUnit values must be handled")


@dataclass(frozen=True, slots=True)
class PriceInterval:
    """A half-open UTC tariff period ``[start_at, end_at)``."""

    start_at: datetime
    end_at: datetime
    import_price_per_kwh: Money
    export_price_per_kwh: Money = Decimal("0")
    battery_penalty_per_kwh: Money = Decimal("0")

    def __post_init__(self) -> None:
        start = as_utc(self.start_at, field_name="start_at")
        end = as_utc(self.end_at, field_name="end_at")
        if end <= start:
            raise ValueError("tariff end_at must be after start_at")
        object.__setattr__(self, "start_at", start)
        object.__setattr__(self, "end_at", end)
        for field_name in (
            "import_price_per_kwh",
            "export_price_per_kwh",
            "battery_penalty_per_kwh",
        ):
            object.__setattr__(
                self, field_name, as_decimal(getattr(self, field_name), field_name=field_name)
            )

    def contains(self, at: datetime) -> bool:
        instant = as_utc(at, field_name="at")
        return self.start_at <= instant < self.end_at

    def marginal_rate(self, source: EnergySource) -> Money:
        """Return the marginal local-currency/kWh cost for an energy source."""

        if source is EnergySource.SOLAR:
            # Consuming solar loses the feed-in payment that would otherwise be
            # received, rather than being assumed to be universally free.
            return self.export_price_per_kwh
        if source is EnergySource.BATTERY:
            return self.import_price_per_kwh + self.battery_penalty_per_kwh
        # Unknown is intentionally conservative: price it as import.
        return self.import_price_per_kwh


@dataclass(frozen=True, slots=True)
class EnergyCostBreakdown:
    grid_energy_wh: float
    solar_energy_wh: float
    battery_energy_wh: float
    unknown_energy_wh: float
    cost: Money

    def __post_init__(self) -> None:
        for field_name in (
            "grid_energy_wh",
            "solar_energy_wh",
            "battery_energy_wh",
            "unknown_energy_wh",
        ):
            value = float(getattr(self, field_name))
            if not isfinite(value) or value < 0:
                raise ValueError(f"{field_name} must be a finite non-negative number")
            object.__setattr__(self, field_name, value)
        object.__setattr__(self, "cost", as_decimal(self.cost, field_name="cost"))

    @property
    def total_energy_wh(self) -> float:
        return (
            self.grid_energy_wh
            + self.solar_energy_wh
            + self.battery_energy_wh
            + self.unknown_energy_wh
        )


def cost_for_energy(energy_wh: float, rate_per_kwh: Money) -> Money:
    """Calculate cost for normalised watt-hours at a decimal marginal rate."""

    if not isfinite(float(energy_wh)) or energy_wh < 0:
        raise ValueError("energy_wh must be a finite non-negative number")
    return (Decimal(str(energy_wh)) / Decimal(1000)) * as_decimal(
        rate_per_kwh, field_name="rate_per_kwh"
    )


def split_interval_cost(
    *,
    power_w: float,
    duration_s: float,
    tariff: PriceInterval,
    solar_power_w: float = 0.0,
    battery_power_w: float = 0.0,
) -> EnergyCostBreakdown:
    """Price a load interval while preserving its energy provenance.

    Solar and battery allocations are bounded to total consumption.  Any excess
    requested provenance is a caller error because accepting it could hide a
    double-allocation bug.
    """

    values = (power_w, duration_s, solar_power_w, battery_power_w)
    if any(not isfinite(float(value)) or value < 0 for value in values):
        raise ValueError("power and duration inputs must be finite and non-negative")
    if solar_power_w + battery_power_w > power_w + 1e-9:
        raise ValueError("allocated solar and battery power cannot exceed load power")
    multiplier = duration_s / 3600
    solar_energy = solar_power_w * multiplier
    battery_energy = battery_power_w * multiplier
    grid_energy = max(0.0, power_w - solar_power_w - battery_power_w) * multiplier
    cost = (
        cost_for_energy(grid_energy, tariff.marginal_rate(EnergySource.GRID))
        + cost_for_energy(solar_energy, tariff.marginal_rate(EnergySource.SOLAR))
        + cost_for_energy(battery_energy, tariff.marginal_rate(EnergySource.BATTERY))
    )
    return EnergyCostBreakdown(
        grid_energy_wh=grid_energy,
        solar_energy_wh=solar_energy,
        battery_energy_wh=battery_energy,
        unknown_energy_wh=0.0,
        cost=cost,
    )


@dataclass(frozen=True, slots=True)
class TariffTimeline:
    """Validated chronological tariff intervals; gaps are explicit and safe."""

    intervals: tuple[PriceInterval, ...]

    def __post_init__(self) -> None:
        intervals = tuple(sorted(self.intervals, key=lambda interval: interval.start_at))
        for previous, current in zip(intervals, intervals[1:], strict=False):
            if current.start_at < previous.end_at:
                raise ValueError("tariff intervals must not overlap")
        object.__setattr__(self, "intervals", intervals)

    @classmethod
    def from_iterable(cls, intervals: Iterable[PriceInterval]) -> TariffTimeline:
        return cls(tuple(intervals))

    def at(self, at: datetime) -> PriceInterval | None:
        instant = as_utc(at, field_name="at")
        # Timelines are small in V1 (typically <= 288 samples/day).  A direct
        # scan keeps the API simple and deterministic; callers can cache if a
        # provider supplies a much larger horizon.
        for interval in self.intervals:
            if interval.contains(instant):
                return interval
            if interval.start_at > instant:
                return None
        return None

    def marginal_rate_at(self, at: datetime, source: EnergySource) -> Money | None:
        interval = self.at(at)
        return None if interval is None else interval.marginal_rate(source)
