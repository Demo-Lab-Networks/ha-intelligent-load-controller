"""System Health platform for Load Control."""

from __future__ import annotations

from typing import Any

from homeassistant.components import system_health
from homeassistant.core import HomeAssistant

from .const import DOMAIN


async def async_system_health_info(hass: HomeAssistant) -> dict[str, Any]:
    """Return non-sensitive integration health summary."""

    runtimes = hass.data.get(DOMAIN, {}).get("runtimes", {})
    return {
        "configured_sites": len(runtimes),
        "started_sites": sum(runtime._started for runtime in runtimes.values()),  # noqa: SLF001
        "panel_registered": bool(hass.data.get(DOMAIN, {}).get("panel_registered")),
        "minimum_home_assistant": "2025.4.0",
    }


def async_register(hass: HomeAssistant, register: system_health.SystemHealthRegistration) -> None:
    """Register modern system-health callback."""

    register.async_register_info(async_system_health_info)
