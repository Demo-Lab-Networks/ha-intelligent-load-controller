"""Shared entity classes and device identities."""

from __future__ import annotations

from collections.abc import Callable, Iterable
from typing import Any, Protocol

from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import Entity

from .const import DOMAIN, UPDATE_SIGNAL
from .coordinator import SiteCoordinator


class ConfigSubentryAddEntitiesCallback(Protocol):
    """2025.4 entity-platform callback including config-subentry ownership.

    Home Assistant 2025.4's runtime callback accepts ``config_subentry_id``;
    its public typing alias does not yet describe that keyword.  Keeping the
    protocol here makes each platform express the runtime API precisely while
    preserving association cleanup on subentry deletion.
    """

    def __call__(
        self,
        new_entities: Iterable[Entity],
        update_before_add: bool = False,
        *,
        config_subentry_id: str | None = None,
    ) -> None:
        """Add entities to the entry or one of its config subentries."""


class LoadControlEntity(Entity):
    """Base entity with dispatcher-driven state updates and stable device links."""

    _attr_has_entity_name = True

    def __init__(
        self, coordinator: SiteCoordinator, entry: ConfigEntry, *, load_id: str | None = None
    ) -> None:
        self.coordinator = coordinator
        self.entry = entry
        self.load_id = load_id
        self._unsub: Callable[[], None] | None = None

    @property
    def device_info(self) -> DeviceInfo:
        """Return one site device and one device per load."""

        site_id = str(self.entry.data.get("site_id", self.entry.entry_id))
        if self.load_id is None:
            return DeviceInfo(
                identifiers={(DOMAIN, site_id)},
                name=self.coordinator.site_config["site_name"],
                manufacturer="Intelligent Load Controller",
                model="Electrical site",
                entry_type=None,
            )
        return DeviceInfo(
            identifiers={(DOMAIN, f"{site_id}:{self.load_id}")},
            name=self._load_name(),
            manufacturer="Intelligent Load Controller",
            model="Controlled load",
            via_device=(DOMAIN, site_id),
        )

    async def async_added_to_hass(self) -> None:
        """Refresh when the backend changes, without polling hardware here."""

        self._unsub = async_dispatcher_connect(
            self.hass,
            f"{UPDATE_SIGNAL}_{self.entry.entry_id}",
            self.async_write_ha_state,
        )

    async def async_will_remove_from_hass(self) -> None:
        """Remove dispatcher subscription."""

        if self._unsub is not None:
            self._unsub()
            self._unsub = None

    @property
    def available(self) -> bool:
        """Entities remain observable even while automatic control is disabled."""

        return True

    def _load_config(self) -> dict[str, Any]:
        if self.load_id is None:
            return {}
        for _, config in self.coordinator._load_configs():  # noqa: SLF001 - package boundary helper
            if config.get("load_id") == self.load_id:
                return config
        return {}

    def _load_name(self) -> str:
        return str(self._load_config().get("display_name", self.load_id or "Load"))

    def _require_load_id(self) -> str:
        """Return the load identifier for entities that are scoped to one load."""

        if self.load_id is None:
            raise RuntimeError("This entity is not scoped to a controlled load")
        return self.load_id

    def _load_runtime(self) -> dict[str, Any]:
        if self.load_id is None:
            return {}
        load_runtime = self.coordinator._recovery.get("load_runtime")  # noqa: SLF001
        if not isinstance(load_runtime, dict):
            return {}
        runtime = load_runtime.get(self.load_id)
        if not isinstance(runtime, dict):
            return {}
        return {str(key): value for key, value in runtime.items()}
