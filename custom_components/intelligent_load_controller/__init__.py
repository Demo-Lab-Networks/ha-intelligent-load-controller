"""Intelligent Load Controller integration lifecycle."""

from __future__ import annotations

from typing import Any

import homeassistant.helpers.config_validation as cv
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONFIG_ENTRY_MINOR_VERSION,
    CONFIG_ENTRY_VERSION,
    DATA_RUNTIME,
    DOMAIN,
    LOAD_SUBENTRY_TYPE,
    PLATFORMS,
)
from .coordinator import SiteCoordinator
from .migrations import normalize_load_data, normalize_site_options
from .panel import async_register_panel, async_remove_panel_if_unused
from .services import async_register_services, async_unregister_services
from .storage import RuntimeStore
from .websocket_api import async_register_websocket_api, async_unregister_websocket_api

type IntelligentLoadControllerConfigEntry = ConfigEntry[SiteCoordinator]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up global shared state without starting any controller outputs."""

    domain_data = hass.data.setdefault(DOMAIN, {})
    if DATA_RUNTIME not in domain_data:
        store = RuntimeStore(hass)
        await store.async_load()
        domain_data[DATA_RUNTIME] = store
        domain_data["runtimes"] = {}
    await async_register_services(hass)
    async_register_websocket_api(hass)
    return True


async def async_setup_entry(
    hass: HomeAssistant, entry: IntelligentLoadControllerConfigEntry
) -> bool:
    """Set up one site, stabilising before any later actuator authority is granted."""

    domain_data = hass.data.setdefault(DOMAIN, {})
    # A config entry can be reloaded after the final site was unloaded without
    # Home Assistant re-running ``async_setup`` for the integration module.
    # Restore process-level interfaces here as well; both registrations are
    # explicitly idempotent and do not control a device.
    await async_register_services(hass)
    async_register_websocket_api(hass)
    store: RuntimeStore = domain_data[DATA_RUNTIME]
    runtime = SiteCoordinator(hass, entry, store)
    domain_data["runtimes"][entry.entry_id] = runtime
    entry.runtime_data = runtime
    try:
        await runtime.async_start()
        await async_register_panel(hass)
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    except Exception:
        # Home Assistant only invokes our unload callback after a successful
        # setup.  If a later setup stage fails, remove the observation runtime
        # ourselves so no stale runtime, panel, or service surface survives.
        domain_data["runtimes"].pop(entry.entry_id, None)
        await runtime.async_stop()
        async_remove_panel_if_unused(hass)
        async_unregister_services(hass)
        async_unregister_websocket_api(hass)
        raise
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: IntelligentLoadControllerConfigEntry
) -> bool:
    """Unload entities/panel state without sending a final device command."""

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if not unload_ok:
        return False
    runtime = hass.data.get(DOMAIN, {}).get("runtimes", {}).pop(entry.entry_id, None)
    if runtime is not None:
        await runtime.async_stop()
    async_remove_panel_if_unused(hass)
    async_unregister_services(hass)
    async_unregister_websocket_api(hass)
    return True


async def async_migrate_entry(
    hass: HomeAssistant, entry: IntelligentLoadControllerConfigEntry
) -> bool:
    """Migrate stored configuration metadata only; migrations never control loads."""

    if entry.version > CONFIG_ENTRY_VERSION:
        return False
    try:
        options = normalize_site_options(entry)
        for subentry in entry.subentries.values():
            if subentry.subentry_type != LOAD_SUBENTRY_TYPE:
                continue
            normalized = normalize_load_data(dict(subentry.data))
            if dict(subentry.data) != normalized or subentry.title != normalized["display_name"]:
                hass.config_entries.async_update_subentry(
                    entry,
                    subentry,
                    title=normalized["display_name"],
                    data=normalized,
                )
    except ValueError:
        # A malformed legacy record must remain observable/repairable instead
        # of being coerced into a potentially unsafe actuator configuration.
        return False
    if (
        entry.version != CONFIG_ENTRY_VERSION
        or entry.minor_version != CONFIG_ENTRY_MINOR_VERSION
        or dict(entry.options) != options
    ):
        hass.config_entries.async_update_entry(
            entry,
            version=CONFIG_ENTRY_VERSION,
            minor_version=CONFIG_ENTRY_MINOR_VERSION,
            options=options,
        )
    return True


async def async_remove_entry(
    hass: HomeAssistant, entry: IntelligentLoadControllerConfigEntry
) -> None:
    """Remove bounded integration recovery after Home Assistant deletes a site."""

    domain_data = hass.data.get(DOMAIN, {})
    store = domain_data.get(DATA_RUNTIME) if isinstance(domain_data, dict) else None
    if isinstance(store, RuntimeStore):
        await store.async_remove_site(entry.entry_id)


async def _async_update_listener(
    hass: HomeAssistant, entry: IntelligentLoadControllerConfigEntry
) -> None:
    """Reload a changed entry through the safe observation-first lifecycle."""

    await hass.config_entries.async_reload(entry.entry_id)
