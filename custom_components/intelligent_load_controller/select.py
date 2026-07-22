"""Per-load optimisation mode selects."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import OPTIMISATION_MODES
from .coordinator import SiteCoordinator
from .entity import ConfigSubentryAddEntitiesCallback, LoadControlEntity


class OptimisationModeSelect(LoadControlEntity, SelectEntity):
    """Expose only explicitly supported automatic optimisation modes."""

    _attr_options = sorted(OPTIMISATION_MODES)
    _attr_icon = "mdi:tune-variant"

    def __init__(self, coordinator: SiteCoordinator, entry: ConfigEntry, load_id: str) -> None:
        super().__init__(coordinator, entry, load_id=load_id)
        site_id = str(entry.data.get("site_id", entry.entry_id))
        self._attr_unique_id = f"{site_id}_{load_id}_optimisation_mode"
        self._attr_name = "Optimisation mode"

    @property
    def current_option(self) -> str | None:
        return self._load_config().get("optimisation_mode")

    async def async_select_option(self, option: str) -> None:
        config = self._load_config()
        await self.coordinator.async_update_load(
            self._require_load_id(),
            {"optimisation_mode": option},
            config["config_revision"],
        )


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: ConfigSubentryAddEntitiesCallback
) -> None:
    coordinator: SiteCoordinator = entry.runtime_data
    for subentry, config in coordinator._load_configs():  # noqa: SLF001
        if load_id := config.get("load_id"):
            async_add_entities(
                [OptimisationModeSelect(coordinator, entry, load_id)],
                config_subentry_id=subentry.subentry_id,
            )
