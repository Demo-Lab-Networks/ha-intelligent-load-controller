"""Validated adapter construction from persisted load configuration."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .action_pair import ActionPairAdapter
from .base import AdapterCommand, AdapterFeedback, LoadAdapter
from .battery_load import BatteryLoadAdapter
from .binary_switch import BinarySwitchAdapter
from .ev_charger import BinaryEvAdapter, VariableEvAdapter
from .variable_number import VariableNumberAdapter


class NullAdapter(LoadAdapter):
    """Observation-only adapter for incomplete/invalid configuration and preview."""

    async def async_observe(self) -> AdapterFeedback:
        from datetime import UTC, datetime

        return AdapterFeedback(datetime.now(UTC), available=False, detail="actuator_not_configured")

    async def async_apply(self, command: AdapterCommand) -> AdapterFeedback:
        return await self.async_observe()


def create_adapter(hass: HomeAssistant, load_config: dict[str, Any]) -> LoadAdapter:
    """Create one adapter without executing a configured action during setup."""

    actuator = load_config.get("actuator")
    if not isinstance(actuator, dict):
        return NullAdapter(hass, {})
    adapter_type = str(actuator.get("adapter_type", ""))
    merged = dict(actuator)
    feedback = load_config.get("feedback")
    if isinstance(feedback, dict):
        merged.update({key: value for key, value in feedback.items() if key not in merged})
    load_type = load_config.get("load_type")
    if adapter_type == "switch":
        if load_type == "binary_ev":
            return BinaryEvAdapter(hass, merged)
        if load_type in {"battery_charger", "battery_load"}:
            return BatteryLoadAdapter(hass, merged)
        return BinarySwitchAdapter(hass, merged)
    if adapter_type == "action_pair":
        return ActionPairAdapter(hass, merged)
    if adapter_type == "variable_number":
        if load_type == "variable_ev":
            return VariableEvAdapter(hass, merged)
        return VariableNumberAdapter(hass, merged)
    return NullAdapter(hass, merged)
