"""Automatic-control switches."""

from __future__ import annotations

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .coordinator import SiteCoordinator
from .entity import ConfigSubentryAddEntitiesCallback, LoadControlEntity


class AutomaticControlSwitch(LoadControlEntity, SwitchEntity):
    """Grant or revoke automatic authority without directly toggling equipment."""

    _attr_icon = "mdi:auto-mode"

    def __init__(self, coordinator: SiteCoordinator, entry: ConfigEntry, load_id: str) -> None:
        super().__init__(coordinator, entry, load_id=load_id)
        site_id = str(entry.data.get("site_id", entry.entry_id))
        self._attr_unique_id = f"{site_id}_{load_id}_automatic_control"
        self._attr_name = "Automatic control"

    @property
    def is_on(self) -> bool:
        return bool(self._load_config().get("automatic_control", False))

    async def async_turn_on(self, **kwargs) -> None:
        await self.coordinator.async_set_automatic_control(self._require_load_id(), True)

    async def async_turn_off(self, **kwargs) -> None:
        await self.coordinator.async_set_automatic_control(self._require_load_id(), False)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: ConfigSubentryAddEntitiesCallback
) -> None:
    coordinator: SiteCoordinator = entry.runtime_data
    for subentry, config in coordinator._load_configs():  # noqa: SLF001
        if load_id := config.get("load_id"):
            async_add_entities(
                [AutomaticControlSwitch(coordinator, entry, load_id)],
                config_subentry_id=subentry.subentry_id,
            )
