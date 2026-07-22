"""Coordinator schema, revision, preview, and override semantics."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from types import MappingProxyType, SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

pytest.importorskip("homeassistant", reason="requires the Home Assistant test harness")
pytest.importorskip(
    "pytest_homeassistant_custom_component",
    reason="requires pytest-homeassistant-custom-component",
)

from homeassistant.config_entries import ConfigSubentry

from custom_components.intelligent_load_controller.adapters import NullAdapter
from custom_components.intelligent_load_controller.const import LOAD_SUBENTRY_TYPE
from custom_components.intelligent_load_controller.coordinator import (
    ConfigConflictError,
    SiteCoordinator,
)
from custom_components.intelligent_load_controller.schema import (
    ConfigurationValidationError,
    validate_load_config,
)

pytestmark = pytest.mark.usefixtures("enable_custom_integrations")


async def test_coordinator_preserves_revision_and_manual_override_semantics(
    hass,
    load_control_config_entry,
    load_config,
    monkeypatch,
    runtime_store,
) -> None:
    """Configuration changes and manual intent persist without device actions."""

    load_config["actuator"] = {
        "adapter_type": "switch",
        "entity_id": "switch.source_load",
    }
    load_config["feedback"] = {"state_entity_id": "switch.source_load"}
    service_call = AsyncMock()
    with patch.object(type(hass.services), "async_call", new=service_call):
        coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
        await coordinator.async_start()

        created = await coordinator.async_add_load(load_config)
        load_id = created["load_id"]
        assert created["config_revision"] == 0
        assert len(load_control_config_entry.subentries) == 1

        updated = await coordinator.async_update_load(
            load_id,
            {"display_name": "Updated Load", "expected_power_w": 1500},
            if_revision=0,
        )
        assert updated["display_name"] == "Updated Load"
        assert updated["config_revision"] == 1

        with pytest.raises(ConfigConflictError):
            await coordinator.async_update_load(
                load_id,
                {"display_name": "Stale update"},
                if_revision=0,
            )

        with pytest.raises(ConfigConflictError):
            await coordinator.async_duplicate_load(load_id, if_revision=0)

        duplicate = await coordinator.async_duplicate_load(load_id, if_revision=1)
        assert duplicate["load_id"] != load_id
        assert duplicate["actuator"] == {}
        assert duplicate["feedback"] == {}
        assert duplicate["automatic_control"] is False

        with pytest.raises(ConfigConflictError):
            await coordinator.async_delete_load(load_id, if_revision=0)

        with pytest.raises(ConfigConflictError):
            await coordinator.async_set_automatic_control(load_id, False, if_revision=0)

        disabled = await coordinator.async_set_automatic_control(load_id, False)
        assert disabled["automatic_control"] is False
        assert disabled["config_revision"] == 2

        override = await coordinator.async_start_override(load_id, "on", indefinite=True)
        assert override["desired_state"] == "on"
        assert override["indefinite"] is True
        listed = await coordinator.async_load_list()
        assert listed[0]["state"] == "manual_on"
        assert listed[0]["reason_code"] == "manual_indefinite_override"

        enabled = await coordinator.async_set_automatic_control(load_id, True)
        assert enabled["automatic_control"] is True
        listed = await coordinator.async_load_list()
        assert listed[0]["state"] == "idle"
        assert listed[0]["override"] is None

        preview = await coordinator.async_preview(
            {
                "kind": "load",
                "load_id": load_id,
                "config": {"expected_power_w": 1500},
            }
        )
        assert preview["valid"] is True
        assert preview["preview_only"] is True
        assert preview["plan"]["preview_only"] is True

    service_call.assert_not_awaited()


async def test_site_rejects_duplicate_actuator_bindings_in_writes_and_previews(
    hass,
    load_control_config_entry,
    load_config,
    runtime_store,
) -> None:
    """Only one load can acquire automatic authority over a HA actuator target."""

    source_config = dict(load_config)
    source_config["actuator"] = {
        "adapter_type": "switch",
        "entity_id": "switch.shared_actuator",
    }
    source_config["feedback"] = {"state_entity_id": "switch.shared_actuator"}
    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    await coordinator.async_start()
    source = await coordinator.async_add_load(source_config)

    duplicate_target = dict(source_config)
    duplicate_target["display_name"] = "Conflicting load"
    with pytest.raises(ConfigurationValidationError) as add_error:
        await coordinator.async_add_load(duplicate_target)
    assert {issue.code for issue in add_error.value.issues} == {"duplicate_actuator_binding"}

    unbound_config = dict(load_config)
    unbound_config["display_name"] = "Draft load"
    unbound_config["actuator"] = {}
    unbound_config["feedback"] = {}
    draft = await coordinator.async_add_load(unbound_config)
    with pytest.raises(ConfigurationValidationError) as update_error:
        await coordinator.async_update_load(
            draft["load_id"],
            {"actuator": source_config["actuator"]},
            if_revision=draft["config_revision"],
        )
    assert {issue.code for issue in update_error.value.issues} == {"duplicate_actuator_binding"}

    preview = await coordinator.async_preview({"kind": "load", "config": duplicate_target})
    assert preview["valid"] is False
    assert {issue["code"] for issue in preview["issues"]} == {"duplicate_actuator_binding"}
    assert source["load_id"] != draft["load_id"]


async def test_decision_report_redacts_raw_actuator_errors(
    hass,
    load_control_config_entry,
    runtime_store,
) -> None:
    """CSV/WebSocket reports never disclose prior adapter exception details."""

    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    await coordinator.async_start()
    coordinator._record_decision(  # noqa: SLF001 - simulate an old persisted runtime record
        "fault",
        "actuator_unavailable",
        "switch.private_hot_water rejected token=secret-value",
        load_id="load-1",
    )

    report = await coordinator.async_export_decision_report()

    event = report["events"][-1]
    assert event["reason_code"] == "actuator_unavailable"
    assert event["message"] == (
        "The configured actuator was unavailable or did not complete the requested operation."
    )
    assert "private_hot_water" not in event["message"]
    assert "secret-value" not in event["message"]


async def test_legacy_duplicate_actuator_bindings_never_acquire_live_adapters(
    hass,
    load_control_config_entry,
    load_config,
    runtime_store,
) -> None:
    """Persisted legacy collisions fail closed until one binding is repaired."""

    options = dict(load_control_config_entry.options)
    options.update(
        {
            "hard_import_limit_w": 5000,
            "grid_power_entity_id": "sensor.grid_power",
        }
    )
    hass.config_entries.async_update_entry(load_control_config_entry, options=options)
    hass.states.async_set("sensor.grid_power", "0")

    configs = []
    for display_name in ("First legacy load", "Second legacy load"):
        config = dict(load_config)
        config.update(
            {
                "display_name": display_name,
                "actuator": {
                    "adapter_type": "switch",
                    "entity_id": "switch.legacy_shared",
                },
            }
        )
        normalized = validate_load_config(config, create_id=True)
        configs.append(normalized)
        hass.config_entries.async_add_subentry(
            load_control_config_entry,
            ConfigSubentry(
                data=MappingProxyType(normalized),
                subentry_type=LOAD_SUBENTRY_TYPE,
                title=normalized["display_name"],
                unique_id=normalized["load_id"],
            ),
        )

    service_call = AsyncMock()
    with patch.object(type(hass.services), "async_call", new=service_call):
        coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
        await coordinator.async_start()
        await coordinator.async_replan(reason="legacy_collision_test")

    conflicted_ids = {config["load_id"] for config in configs}
    assert coordinator._conflicting_actuator_load_ids == conflicted_ids  # noqa: SLF001
    assert all(
        isinstance(coordinator._adapters[load_id], NullAdapter) for load_id in conflicted_ids
    )  # noqa: SLF001
    assert {
        item["load_id"]
        for item in await coordinator.async_load_list()
        if item["state"] == "fault" and item["reason_code"] == "duplicate_actuator_binding"
    } == conflicted_ids
    service_call.assert_not_awaited()


async def test_preview_uses_staged_configuration_without_persisting_or_actuating(
    hass,
    load_control_config_entry,
    runtime_store,
) -> None:
    """A configuration preview is a pure staged read of controller state."""

    service_call = AsyncMock()
    with patch.object(type(hass.services), "async_call", new=service_call):
        coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
        await coordinator.async_start()
        before = runtime_store.get_site(load_control_config_entry.entry_id)

        preview = await coordinator.async_preview(
            {"kind": "site", "config": {"site_name": "Preview-only Site"}}
        )

    assert preview["valid"] is True
    assert preview["preview_only"] is True
    assert preview["config"]["config"]["site_name"] == "Preview-only Site"
    assert coordinator.site_config["site_name"] == "Test Site"
    assert runtime_store.get_site(load_control_config_entry.entry_id) == before
    service_call.assert_not_awaited()


def test_stale_split_grid_input_fails_closed(
    hass,
    load_control_config_entry,
    runtime_store,
    monkeypatch,
) -> None:
    """A fresh export meter cannot mask a stale required import meter."""

    options = dict(load_control_config_entry.options)
    options.update(
        {
            "grid_import_entity_id": "sensor.grid_import",
            "grid_export_entity_id": "sensor.grid_export",
            "sensor_stale_seconds": 60,
        }
    )
    hass.config_entries.async_update_entry(load_control_config_entry, options=options)
    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    now = datetime.now(UTC)
    readings = {
        "sensor.grid_import": (400.0, now - timedelta(seconds=61)),
        "sensor.grid_export": (0.0, now),
    }
    monkeypatch.setattr(
        coordinator,
        "_number_state",
        lambda entity_id: readings.get(str(entity_id), (None, None)),
    )

    snapshot = coordinator._site_snapshot()

    assert snapshot.available is False
    assert snapshot.input_age_s > 60


def test_stale_future_price_feed_has_no_cost_timeline(
    hass,
    load_control_config_entry,
    runtime_store,
    monkeypatch,
) -> None:
    """A stale future-price entity cannot silently fall back to a flat price."""

    options = dict(load_control_config_entry.options)
    options.update(
        {
            "tariff_mode": "future_entity",
            "future_price_entity_id": "sensor.future_prices",
            "price_stale_seconds": 60,
        }
    )
    hass.config_entries.async_update_entry(load_control_config_entry, options=options)
    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    now = datetime.now(UTC)
    stale_state = SimpleNamespace(
        state="available",
        last_updated=now - timedelta(seconds=61),
        attributes={
            "prices": [
                {
                    "start": now.isoformat(),
                    "end": (now + timedelta(minutes=30)).isoformat(),
                    "price": 0.25,
                }
            ]
        },
    )
    monkeypatch.setattr(type(hass.states), "get", lambda _states, _entity_id: stale_state)

    assert coordinator._tariff_timeline(now).intervals == ()
