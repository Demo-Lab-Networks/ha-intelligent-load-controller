"""EV-specific adapter feedback layered over generic binary/variable adapters."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any, Protocol

from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant

from .base import AdapterFeedback
from .binary_switch import BinarySwitchAdapter
from .variable_number import VariableNumberAdapter


class _EvFeedbackHost(Protocol):
    """Attributes supplied by the concrete binary or variable adapter."""

    config: dict[str, Any]
    hass: HomeAssistant

    def _numeric_state(self, entity_id: Any) -> float | None: ...

    def _boolean_state(self, entity_id: Any) -> bool | None: ...


class _EvFeedbackMixin:
    def _ev_values(
        self: _EvFeedbackHost,
    ) -> tuple[bool | None, bool | None, float | None]:
        connected = self._boolean_state(self.config.get("connected_entity_id"))
        charging = self._boolean_state(self.config.get("charging_entity_id"))
        soc = self._numeric_state(self.config.get("soc_entity_id"))
        return connected, charging, soc

    def _boolean_state(self: _EvFeedbackHost, entity_id: Any) -> bool | None:
        if not isinstance(entity_id, str):
            return None
        state = self.hass.states.get(entity_id)
        if state is None or state.state in {STATE_UNAVAILABLE, STATE_UNKNOWN}:
            return None
        return state.state.lower() in {"on", "true", "connected", "charging"}


class BinaryEvAdapter(_EvFeedbackMixin, BinarySwitchAdapter):
    """Binary EV charger with connection, charging-state, and SOC feedback."""

    async def async_observe(self) -> AdapterFeedback:
        base = await super().async_observe()
        connected, charging, soc = self._ev_values()
        return AdapterFeedback(
            observed_at=datetime.now(UTC),
            available=base.available,
            confirmed_state=base.confirmed_state,
            active_power_w=base.active_power_w,
            energy_kwh=base.energy_kwh,
            connected=connected,
            charging=charging,
            state_of_charge_pct=soc,
            detail=base.detail,
        )


class VariableEvAdapter(_EvFeedbackMixin, VariableNumberAdapter):
    """Variable-current EV charger; current validation is inherited from number adapter."""

    async def async_observe(self) -> AdapterFeedback:
        base = await super().async_observe()
        connected, charging, soc = self._ev_values()
        return AdapterFeedback(
            observed_at=datetime.now(UTC),
            available=base.available,
            confirmed_state=base.confirmed_state,
            active_power_w=base.active_power_w,
            energy_kwh=base.energy_kwh,
            connected=connected,
            charging=charging,
            state_of_charge_pct=soc,
            setpoint=base.setpoint,
            detail=base.detail,
        )
