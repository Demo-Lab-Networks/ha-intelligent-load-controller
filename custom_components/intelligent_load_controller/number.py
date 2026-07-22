"""Per-load numeric settings intended for routine operation."""

from __future__ import annotations

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .coordinator import SiteCoordinator
from .entity import ConfigSubentryAddEntitiesCallback, LoadControlEntity


class PriorityNumber(LoadControlEntity, NumberEntity):
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_mode = NumberMode.BOX
    _attr_icon = "mdi:sort-numeric-ascending"

    def __init__(self, coordinator: SiteCoordinator, entry: ConfigEntry, load_id: str) -> None:
        super().__init__(coordinator, entry, load_id=load_id)
        site_id = str(entry.data.get("site_id", entry.entry_id))
        self._attr_unique_id = f"{site_id}_{load_id}_priority"
        self._attr_name = "Priority"

    @property
    def native_value(self) -> float | None:
        return float(self._load_config().get("priority", 0))

    async def async_set_native_value(self, value: float) -> None:
        config = self._load_config()
        await self.coordinator.async_update_load(
            self._require_load_id(),
            {"priority": int(value)},
            config["config_revision"],
        )


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: ConfigSubentryAddEntitiesCallback
) -> None:
    coordinator: SiteCoordinator = entry.runtime_data
    for subentry, config in coordinator._load_configs():  # noqa: SLF001
        if load_id := config.get("load_id"):
            async_add_entities(
                [PriorityNumber(coordinator, entry, load_id)],
                config_subentry_id=subentry.subentry_id,
            )
