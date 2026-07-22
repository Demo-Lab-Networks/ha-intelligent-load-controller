"""Explicit, non-destructive controller buttons."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .coordinator import SiteCoordinator
from .entity import ConfigSubentryAddEntitiesCallback, LoadControlEntity


class ReplanButton(LoadControlEntity, ButtonEntity):
    _attr_icon = "mdi:refresh"

    def __init__(
        self, coordinator: SiteCoordinator, entry: ConfigEntry, load_id: str | None = None
    ) -> None:
        super().__init__(coordinator, entry, load_id=load_id)
        site_id = str(entry.data.get("site_id", entry.entry_id))
        suffix = load_id or "site"
        self._attr_unique_id = f"{site_id}_{suffix}_replan"
        self._attr_name = "Replan"

    async def async_press(self) -> None:
        await self.coordinator.async_replan(reason="button")


class ClearOverrideButton(LoadControlEntity, ButtonEntity):
    _attr_icon = "mdi:cancel"

    def __init__(self, coordinator: SiteCoordinator, entry: ConfigEntry, load_id: str) -> None:
        super().__init__(coordinator, entry, load_id=load_id)
        site_id = str(entry.data.get("site_id", entry.entry_id))
        self._attr_unique_id = f"{site_id}_{load_id}_clear_override"
        self._attr_name = "Clear override"

    async def async_press(self) -> None:
        await self.coordinator.async_clear_override(self._require_load_id())


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: ConfigSubentryAddEntitiesCallback
) -> None:
    coordinator: SiteCoordinator = entry.runtime_data
    async_add_entities([ReplanButton(coordinator, entry)])
    for subentry, config in coordinator._load_configs():  # noqa: SLF001
        if load_id := config.get("load_id"):
            async_add_entities(
                (
                    ReplanButton(coordinator, entry, load_id),
                    ClearOverrideButton(coordinator, entry, load_id),
                ),
                config_subentry_id=subentry.subentry_id,
            )
