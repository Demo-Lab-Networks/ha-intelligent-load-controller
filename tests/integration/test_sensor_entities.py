"""Sensor entity metadata and runtime values."""

from __future__ import annotations

from typing import Any

import pytest

pytest.importorskip("homeassistant", reason="requires the Home Assistant test harness")
pytest.importorskip(
    "pytest_homeassistant_custom_component",
    reason="requires pytest-homeassistant-custom-component",
)

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.const import UnitOfEnergy, UnitOfPower, UnitOfTime

from custom_components.intelligent_load_controller.coordinator import SiteCoordinator
from custom_components.intelligent_load_controller.sensor import (
    _LOAD_SENSORS,
    _SITE_SENSORS,
    LoadSensor,
    SiteSensor,
)

pytestmark = pytest.mark.usefixtures("enable_custom_integrations")

SensorMetadata = tuple[Any, Any, str | None]
NativeValueTypes = tuple[type[Any], ...]
LoadSensorExpectation = tuple[Any, Any, str | None, NativeValueTypes]


def _sensor_metadata(entity: SensorEntity) -> dict[str, Any]:
    return {
        "device_class": entity.device_class,
        "state_class": entity.state_class,
        "native_unit_of_measurement": entity.native_unit_of_measurement,
    }


async def test_site_sensor_entities_expose_valid_metadata_and_values(
    hass,
    load_control_config_entry,
    runtime_store,
) -> None:
    """Site sensors use HA-compatible metadata and observable native values."""

    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    await coordinator.async_start()

    expected_metadata: dict[str, SensorMetadata] = {
        "state": (None, None, None),
        "active_loads": (None, SensorStateClass.MEASUREMENT, None),
        "waiting_loads": (None, SensorStateClass.MEASUREMENT, None),
        "controlled_power": (
            SensorDeviceClass.POWER,
            SensorStateClass.MEASUREMENT,
            UnitOfPower.WATT,
        ),
    }
    expected_value_types: dict[str, NativeValueTypes] = {
        "state": (str,),
        "active_loads": (int,),
        "waiting_loads": (int,),
        "controlled_power": (int, float),
    }

    assert {description.key for description in _SITE_SENSORS} == set(expected_metadata)
    for description in _SITE_SENSORS:
        entity = SiteSensor(coordinator, load_control_config_entry, description)
        device_class, state_class, unit = expected_metadata[description.key]
        assert isinstance(entity, SensorEntity)
        assert entity.available is True
        assert _sensor_metadata(entity) == {
            "device_class": device_class,
            "state_class": state_class,
            "native_unit_of_measurement": unit,
        }
        assert isinstance(entity.native_value, expected_value_types[description.key])


async def test_load_sensor_entities_expose_valid_metadata_and_values(
    hass,
    load_control_config_entry,
    load_config,
    runtime_store,
) -> None:
    """Every per-load sensor entity has HA-compatible metadata and value shape."""

    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    await coordinator.async_start()
    created = await coordinator.async_add_load(load_config)
    load_id = created["load_id"]
    coordinator._recovery.setdefault("load_runtime", {})[load_id] = {  # noqa: SLF001
        "current_power_w": 123.4,
        "runtime_today_h": 1.5,
        "confirmed_runtime_today_h": 1.25,
        "energy_total_kwh": 7.5,
        "energy_today_kwh": 0.75,
        "target_status": "pending",
        "next_action": "2026-07-30T05:00:00+00:00",
        "fault_state": "none",
    }
    coordinator._recovery.setdefault("learning", {})[load_id] = {  # noqa: SLF001
        "expected_power_w": 1200.0,
        "confidence": 0.8,
    }

    expected: dict[str, LoadSensorExpectation] = {
        "controller_state": (None, None, None, (str,)),
        "decision_reason": (None, None, None, (str,)),
        "current_power": (
            SensorDeviceClass.POWER,
            SensorStateClass.MEASUREMENT,
            UnitOfPower.WATT,
            (int, float),
        ),
        "runtime_today": (
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            UnitOfTime.HOURS,
            (int, float),
        ),
        "confirmed_runtime_today": (
            SensorDeviceClass.DURATION,
            SensorStateClass.MEASUREMENT,
            UnitOfTime.HOURS,
            (int, float),
        ),
        "energy": (
            SensorDeviceClass.ENERGY,
            SensorStateClass.TOTAL_INCREASING,
            UnitOfEnergy.KILO_WATT_HOUR,
            (int, float),
        ),
        "energy_today": (
            SensorDeviceClass.ENERGY,
            SensorStateClass.TOTAL,
            UnitOfEnergy.KILO_WATT_HOUR,
            (int, float),
        ),
        "target_status": (None, None, None, (str,)),
        "next_action": (None, None, None, (str,)),
        "fault_state": (None, None, None, (str,)),
        "learned_power": (
            SensorDeviceClass.POWER,
            SensorStateClass.MEASUREMENT,
            UnitOfPower.WATT,
            (int, float),
        ),
        "learning_confidence": (None, SensorStateClass.MEASUREMENT, None, (int, float)),
    }

    assert {description.key for description in _LOAD_SENSORS} == set(expected)
    for description in _LOAD_SENSORS:
        entity = LoadSensor(coordinator, load_control_config_entry, load_id, description)
        device_class, state_class, unit, value_type = expected[description.key]
        assert isinstance(entity, SensorEntity)
        assert entity.available is True
        assert _sensor_metadata(entity) == {
            "device_class": device_class,
            "state_class": state_class,
            "native_unit_of_measurement": unit,
        }
        assert isinstance(entity.native_value, value_type)
