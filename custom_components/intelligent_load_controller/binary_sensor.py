"""Fault and health binary sensors."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .coordinator import SiteCoordinator
from .entity import ConfigSubentryAddEntitiesCallback, LoadControlEntity


class LoadFaultBinarySensor(LoadControlEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(self, coordinator: SiteCoordinator, entry: ConfigEntry, load_id: str) -> None:
        super().__init__(coordinator, entry, load_id=load_id)
        site_id = str(entry.data.get("site_id", entry.entry_id))
        self._attr_unique_id = f"{site_id}_{load_id}_fault"
        self._attr_name = "Fault"

    @property
    def is_on(self) -> bool:
        config = self._load_config()
        return bool(
            config.get("invalid")
            or self._require_load_id() in self.coordinator._conflicting_actuator_load_ids  # noqa: SLF001
            or self._load_runtime().get("fault_state")
        )


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: ConfigSubentryAddEntitiesCallback
) -> None:
    coordinator: SiteCoordinator = entry.runtime_data
    for subentry, config in coordinator._load_configs():  # noqa: SLF001
        if load_id := config.get("load_id"):
            async_add_entities(
                [LoadFaultBinarySensor(coordinator, entry, load_id)],
                config_subentry_id=subentry.subentry_id,
            )
