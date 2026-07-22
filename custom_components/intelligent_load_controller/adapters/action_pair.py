"""Adapter for explicitly configured Home Assistant on/off actions."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN

from .base import AdapterCommand, AdapterError, AdapterFeedback, LoadAdapter


class ActionPairAdapter(LoadAdapter):
    """Invoke only user-selected action pairs; never test them during setup."""

    async def async_observe(self) -> AdapterFeedback:
        state_entity = self.config.get("state_entity_id")
        state = self.hass.states.get(state_entity) if isinstance(state_entity, str) else None
        available = state is None or state.state not in {STATE_UNAVAILABLE, STATE_UNKNOWN}
        confirmed: bool | None = None
        if state is not None:
            confirmed = state.state.lower() in {"on", "open", "running", "charging"}
        return AdapterFeedback(
            observed_at=datetime.now(UTC),
            available=available,
            confirmed_state=confirmed,
            active_power_w=self._numeric_state(self.config.get("power_entity_id")),
            detail=state.state if state is not None else "no_state_feedback",
        )

    async def async_apply(self, command: AdapterCommand) -> AdapterFeedback:
        if command.desired_enabled is not None:
            action = self.config.get("on_action" if command.desired_enabled else "off_action")
            await self._async_call_action(action)
        return await self.async_observe()

    async def _async_call_action(self, action: Any) -> None:
        if not isinstance(action, dict):
            raise AdapterError("Configured action is missing")
        service = action.get("service")
        if not isinstance(service, str) or "." not in service:
            raise AdapterError("Configured action must include a domain.service")
        domain, service_name = service.split(".", 1)
        data = action.get("data", {})
        if not isinstance(data, dict):
            raise AdapterError("Configured action data must be an object")
        target = action.get("target")
        if target is not None and not isinstance(target, dict):
            raise AdapterError("Configured action target must be an object")
        await self.hass.services.async_call(
            domain, service_name, data, target=target, blocking=True
        )

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
