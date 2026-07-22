"""Redacted, bounded diagnostics for support and repair workflows."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.redact import async_redact_data

from .const import DOMAIN
from .coordinator import get_coordinator

_TO_REDACT = {
    "actuator",
    "api_key",
    "area_id",
    "authorization",
    "data",
    "device_id",
    "entity_id",
    "energy_entity_id",
    "feed_in_entity_id",
    "feedback",
    "future_price_entity_id",
    "grid_power_entity_id",
    "grid_import_entity_id",
    "grid_export_entity_id",
    "label_id",
    "solar_power_entity_id",
    "on_action",
    "off_action",
    "password",
    "power_entity_id",
    "setpoint_entity_id",
    "state_entity_id",
    "target",
    "notification_actions",
    "token",
    "access_token",
    "user_id",
    "latitude",
    "longitude",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return entry diagnostics without unlimited history or sensitive identifiers."""

    runtime = get_coordinator(hass, entry.entry_id)
    report = await runtime.async_export_decision_report()
    config = await runtime.async_configuration_read()
    return async_redact_data(
        {
            "integration": {"domain": DOMAIN, "entry_id": entry.entry_id, "version": "0.1.0"},
            "site": config["site"],
            "loads": config["loads"],
            "report": report,
        },
        _TO_REDACT,
    )


async def async_get_device_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry, device: Any
) -> dict[str, Any]:
    """Return redacted diagnostics restricted to a selected Load Control device."""

    runtime = get_coordinator(hass, entry.entry_id)
    identifiers: set[tuple[str, ...]] = getattr(device, "identifiers", set())
    load_id: str | None = None
    for identifier_parts in identifiers:
        if len(identifier_parts) < 2:
            continue
        domain, identifier = identifier_parts[0], identifier_parts[1]
        if domain == DOMAIN and ":" in identifier:
            load_id = identifier.rsplit(":", 1)[-1]
            break
    return async_redact_data(await runtime.async_export_decision_report(load_id), _TO_REDACT)
