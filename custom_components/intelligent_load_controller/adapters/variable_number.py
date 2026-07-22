"""Adapter for an enable actuator plus bounded number-entity setpoint."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from homeassistant.const import ATTR_ENTITY_ID, STATE_UNAVAILABLE, STATE_UNKNOWN

from .action_pair import ActionPairAdapter
from .base import AdapterCommand, AdapterError, AdapterFeedback


class VariableNumberAdapter(ActionPairAdapter):
    """Apply only supported quantized setpoints and retain enable fallback."""

    async def async_observe(self) -> AdapterFeedback:
        feedback = await super().async_observe()
        number_entity = self.config.get("setpoint_entity_id")
        setpoint = self._numeric_state(number_entity)
        return AdapterFeedback(
            observed_at=datetime.now(UTC),
            available=feedback.available,
            confirmed_state=feedback.confirmed_state,
            active_power_w=feedback.active_power_w,
            energy_kwh=feedback.energy_kwh,
            connected=feedback.connected,
            charging=feedback.charging,
            setpoint=setpoint,
            detail=feedback.detail,
        )

    async def async_apply(self, command: AdapterCommand) -> AdapterFeedback:
        if command.desired_enabled is not None:
            await super().async_apply(
                AdapterCommand(
                    desired_enabled=command.desired_enabled,
                    source=command.source,
                    reason_code=command.reason_code,
                )
            )
        if command.setpoint is not None:
            value = self._bounded_setpoint(command.setpoint)
            entity_id = self.config.get("setpoint_entity_id")
            if not isinstance(entity_id, str) or not entity_id.startswith("number."):
                raise AdapterError("Variable adapter requires a number setpoint entity")
            await self.hass.services.async_call(
                "number", "set_value", {ATTR_ENTITY_ID: entity_id, "value": value}, blocking=True
            )
        return await self.async_observe()

    def _bounded_setpoint(self, requested: float) -> float:
        minimum = float(self.config.get("minimum_setpoint", 0))
        maximum = float(self.config.get("maximum_setpoint", minimum))
        increment = float(self.config.get("setpoint_increment", 1))
        if minimum > maximum or increment <= 0:
            raise AdapterError("Invalid variable setpoint bounds")
        bounded = min(max(float(requested), minimum), maximum)
        steps = round((bounded - minimum) / increment)
        return min(maximum, max(minimum, minimum + steps * increment))

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
