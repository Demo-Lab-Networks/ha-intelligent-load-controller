"""Generic switch/action controlled battery-charger adapter."""

from __future__ import annotations

from .binary_switch import BinarySwitchAdapter


class BatteryLoadAdapter(BinarySwitchAdapter):
    """V1 generic battery load; it deliberately does not command discharge."""

    pass
