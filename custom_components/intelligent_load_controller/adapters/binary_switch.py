"""Adapter for a Home Assistant switch/contact entity."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from homeassistant.const import (
    ATTR_ENTITY_ID,
    STATE_ON,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)

from .base import AdapterCommand, AdapterError, AdapterFeedback, LoadAdapter


class BinarySwitchAdapter(LoadAdapter):
    """Control a single switch while retaining independent state/power feedback."""

    @property
    def entity_id(self) -> str:
        entity_id = self.config.get("entity_id")
        if not isinstance(entity_id, str) or not entity_id.startswith("switch."):
            raise AdapterError("Binary switch adapter requires a switch entity_id")
        return entity_id

    async def async_observe(self) -> AdapterFeedback:
        state = self.hass.states.get(self.entity_id)
        available = state is not None and state.state not in {STATE_UNAVAILABLE, STATE_UNKNOWN}
        confirmed = state.state == STATE_ON if available and state is not None else None
        power = self._numeric_state(self.config.get("power_entity_id"))
        energy = self._numeric_state(self.config.get("energy_entity_id"))
        return AdapterFeedback(
            observed_at=datetime.now(UTC),
            available=available,
            confirmed_state=confirmed,
            active_power_w=power,
            energy_kwh=energy,
            detail=state.state if state is not None else "entity_missing",
        )

    async def async_apply(self, command: AdapterCommand) -> AdapterFeedback:
        if command.desired_enabled is None:
            return await self.async_observe()
        await self.hass.services.async_call(
            "switch",
            "turn_on" if command.desired_enabled else "turn_off",
            {ATTR_ENTITY_ID: self.entity_id},
            blocking=True,
        )
        return await self.async_observe()

    def _numeric_state(self, entity_id: Any) -> float | None:
        if not isinstance(entity_id, str):
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in {STATE_UNAVAILABLE, STATE_UNKNOWN}:
            return None
        try:
            return float(state.state)
        except (TypeError, ValueError):
            return None
