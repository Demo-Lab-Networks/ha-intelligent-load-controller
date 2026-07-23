"""Bundled sidebar panel registration."""

from __future__ import annotations

from pathlib import Path
from typing import Final

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import (
    DATA_PANEL_REGISTERED,
    DOMAIN,
    PANEL_ICON,
    PANEL_MODULE_URL,
    PANEL_STATIC_PATH,
    PANEL_TAG,
    PANEL_TITLE,
    PANEL_URL_PATH,
)

_DIST_DIRECTORY: Final = Path(__file__).parent / "frontend" / "dist"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register static assets and the full-screen panel once per HA instance."""

    domain_data = hass.data.setdefault(DOMAIN, {})
    if not domain_data.get("panel_static_registered"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(PANEL_STATIC_PATH, str(_DIST_DIRECTORY), cache_headers=False)]
        )
        domain_data["panel_static_registered"] = True
    if domain_data.get(DATA_PANEL_REGISTERED):
        return
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL_PATH,
        config={
            "_panel_custom": {
                "name": PANEL_TAG,
                "module_url": PANEL_MODULE_URL,
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=False,
    )
    domain_data[DATA_PANEL_REGISTERED] = True


def async_remove_panel_if_unused(hass: HomeAssistant) -> None:
    """Remove the sidebar item after the final site entry unloads."""

    domain_data = hass.data.get(DOMAIN, {})
    if domain_data.get("runtimes"):
        return
    if not domain_data.get(DATA_PANEL_REGISTERED):
        return
    frontend.async_remove_panel(hass, PANEL_URL_PATH)
    domain_data[DATA_PANEL_REGISTERED] = False
