"""Site and per-load sensors, including Energy dashboard-compatible totals."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfEnergy, UnitOfPower, UnitOfTime
from homeassistant.core import HomeAssistant

from .coordinator import SiteCoordinator
from .entity import ConfigSubentryAddEntitiesCallback, LoadControlEntity


@dataclass(frozen=True, slots=True)
class SiteSensorDescription:
    key: str
    name: str
    value_key: str
    device_class: SensorDeviceClass | None = None
    state_class: SensorStateClass | None = None
    native_unit_of_measurement: str | None = None


_SITE_SENSORS = (
    SiteSensorDescription("state", "Site state", "state"),
    SiteSensorDescription(
        "active_loads", "Active loads", "active_loads", state_class=SensorStateClass.MEASUREMENT
    ),
    SiteSensorDescription(
        "waiting_loads", "Waiting loads", "waiting_loads", state_class=SensorStateClass.MEASUREMENT
    ),
    SiteSensorDescription(
        "controlled_power",
        "Total controlled power",
        "total_controlled_power_w",
        SensorDeviceClass.POWER,
        SensorStateClass.MEASUREMENT,
        UnitOfPower.WATT,
    ),
)


class SiteSensor(LoadControlEntity, SensorEntity):
    """A summary sensor for a site-level field."""

    def __init__(
        self, coordinator: SiteCoordinator, entry: ConfigEntry, description: SiteSensorDescription
    ) -> None:
        super().__init__(coordinator, entry)
        self.description = description
        site_id = str(entry.data.get("site_id", entry.entry_id))
        self._attr_unique_id = f"{site_id}_{description.key}"
        self._attr_name = description.name
        self._attr_device_class = description.device_class
        self._attr_state_class = description.state_class
        self._attr_native_unit_of_measurement = description.native_unit_of_measurement

    @property
    def native_value(self) -> Any:
        # Summary fields are intentionally cached/stable rather than reading arbitrary HA state.
        if self.description.value_key == "state":
            return "initialising" if not self.coordinator._started else "idle"  # noqa: SLF001
        if self.description.value_key == "active_loads":
            return len(
                [
                    feedback
                    for feedback in self.coordinator._feedback.values()
                    if feedback.confirmed_state
                ]
            )  # noqa: SLF001
        if self.description.value_key == "waiting_loads":
            return len(self.coordinator._load_configs())  # noqa: SLF001
        if self.description.value_key == "total_controlled_power_w":
            return sum(  # noqa: SLF001
                max(0.0, feedback.active_power_w or 0.0)
                for feedback in self.coordinator._feedback.values()
                if feedback.confirmed_state
            )
        return None


@dataclass(frozen=True, slots=True)
class LoadSensorDescription:
    key: str
    name: str
    runtime_key: str | None = None
    device_class: SensorDeviceClass | None = None
    state_class: SensorStateClass | None = None
    native_unit_of_measurement: str | None = None
    default: Any = None


_LOAD_SENSORS = (
    LoadSensorDescription("controller_state", "Controller state"),
    LoadSensorDescription("decision_reason", "Decision reason"),
    LoadSensorDescription(
        "current_power",
        "Current power",
        "current_power_w",
        SensorDeviceClass.POWER,
        SensorStateClass.MEASUREMENT,
        UnitOfPower.WATT,
        0,
    ),
    LoadSensorDescription(
        "runtime_today",
        "Runtime today",
        "runtime_today_h",
        SensorDeviceClass.DURATION,
        SensorStateClass.MEASUREMENT,
        UnitOfTime.HOURS,
        0,
    ),
    LoadSensorDescription(
        "confirmed_runtime_today",
        "Confirmed runtime today",
        "confirmed_runtime_today_h",
        SensorDeviceClass.DURATION,
        SensorStateClass.MEASUREMENT,
        UnitOfTime.HOURS,
        0,
    ),
    LoadSensorDescription(
        "energy",
        "Consumed energy",
        "energy_total_kwh",
        SensorDeviceClass.ENERGY,
        SensorStateClass.TOTAL_INCREASING,
        UnitOfEnergy.KILO_WATT_HOUR,
        0,
    ),
    LoadSensorDescription(
        "energy_today",
        "Energy today",
        "energy_today_kwh",
        SensorDeviceClass.ENERGY,
        SensorStateClass.MEASUREMENT,
        UnitOfEnergy.KILO_WATT_HOUR,
        0,
    ),
    LoadSensorDescription(
        "target_status", "Target status", "target_status", default="not_configured"
    ),
    LoadSensorDescription("next_action", "Next action", "next_action"),
    LoadSensorDescription("fault_state", "Fault state", "fault_state", default="none"),
    LoadSensorDescription(
        "learned_power",
        "Learned power estimate",
        "learned_power_w",
        SensorDeviceClass.POWER,
        SensorStateClass.MEASUREMENT,
        UnitOfPower.WATT,
    ),
    LoadSensorDescription(
        "learning_confidence",
        "Learning confidence",
        "learning_confidence",
        state_class=SensorStateClass.MEASUREMENT,
        default=0,
    ),
)


class LoadSensor(LoadControlEntity, SensorEntity):
    """A stable per-load entity backed only by integration runtime accounting."""

    def __init__(
        self,
        coordinator: SiteCoordinator,
        entry: ConfigEntry,
        load_id: str,
        description: LoadSensorDescription,
    ) -> None:
        super().__init__(coordinator, entry, load_id=load_id)
        self.description = description
        site_id = str(entry.data.get("site_id", entry.entry_id))
        self._attr_unique_id = f"{site_id}_{load_id}_{description.key}"
        self._attr_name = description.name
        self._attr_device_class = description.device_class
        self._attr_state_class = description.state_class
        self._attr_native_unit_of_measurement = description.native_unit_of_measurement

    @property
    def native_value(self) -> Any:
        config = self._load_config()
        runtime = self._load_runtime()
        load_id = self._require_load_id()
        if self.description.key == "controller_state":
            override = self.coordinator._active_overrides().get(load_id)  # noqa: SLF001
            return self.coordinator._load_state(config, override)  # noqa: SLF001
        if self.description.key == "decision_reason":
            override = self.coordinator._active_overrides().get(load_id)  # noqa: SLF001
            return self.coordinator._load_reason(config, override)  # noqa: SLF001
        if self.description.runtime_key is None:
            return self.description.default
        if self.description.runtime_key in runtime:
            return runtime[self.description.runtime_key]
        learning_data = self.coordinator._recovery.get("learning")  # noqa: SLF001
        learning = learning_data.get(load_id, {}) if isinstance(learning_data, dict) else {}
        if self.description.runtime_key == "learned_power_w":
            return learning.get("expected_power_w")
        if self.description.runtime_key == "learning_confidence":
            return learning.get("confidence", self.description.default)
        if self.description.runtime_key in learning:
            return learning[self.description.runtime_key]
        return self.description.default


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: ConfigSubentryAddEntitiesCallback
) -> None:
    """Add site and load sensors for a site config entry."""

    coordinator: SiteCoordinator = entry.runtime_data
    async_add_entities(
        [SiteSensor(coordinator, entry, description) for description in _SITE_SENSORS]
    )
    for subentry, config in coordinator._load_configs():  # noqa: SLF001
        if load_id := config.get("load_id"):
            async_add_entities(
                [
                    LoadSensor(coordinator, entry, load_id, description)
                    for description in _LOAD_SENSORS
                ],
                config_subentry_id=subentry.subentry_id,
            )
