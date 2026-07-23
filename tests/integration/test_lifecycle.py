"""Observation-only setup and unload lifecycle tests."""

from __future__ import annotations

from collections.abc import Iterable
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

pytest.importorskip("homeassistant", reason="requires the Home Assistant test harness")
pytest.importorskip(
    "pytest_homeassistant_custom_component",
    reason="requires pytest-homeassistant-custom-component",
)

from homeassistant.helpers.entity import Entity

from custom_components.intelligent_load_controller import (
    async_remove_entry,
    async_setup,
    async_setup_entry,
    async_unload_entry,
    binary_sensor,
    button,
    number,
    select,
    sensor,
    switch,
)
from custom_components.intelligent_load_controller.const import (
    DATA_RUNTIME,
    DOMAIN,
    PANEL_ICON,
    PANEL_MODULE_URL,
    PANEL_TAG,
    PANEL_TITLE,
    PANEL_URL_PATH,
    SERVICE_REPLAN,
)
from custom_components.intelligent_load_controller.coordinator import SiteCoordinator
from custom_components.intelligent_load_controller.entity import LoadControlEntity
from custom_components.intelligent_load_controller.panel import async_register_panel
from custom_components.intelligent_load_controller.storage import RuntimeStore

pytestmark = pytest.mark.usefixtures("enable_custom_integrations")


async def test_setup_and_unload_do_not_issue_device_actions(
    hass,
    load_control_config_entry,
    monkeypatch,
    runtime_store,
) -> None:
    """Startup, reload plumbing, and unload remain strictly non-actuating."""

    hass.data[DOMAIN] = {DATA_RUNTIME: runtime_store, "runtimes": {}}
    service_call = AsyncMock()
    forward_platforms = AsyncMock()
    unload_platforms = AsyncMock(return_value=True)
    monkeypatch.setattr(hass.config_entries, "async_forward_entry_setups", forward_platforms)
    monkeypatch.setattr(hass.config_entries, "async_unload_platforms", unload_platforms)

    start = AsyncMock()
    stop = AsyncMock()
    with (
        patch.object(type(hass.services), "async_call", new=service_call),
        patch(
            "custom_components.intelligent_load_controller.async_register_services",
            new=AsyncMock(),
        ) as register_services,
        patch(
            "custom_components.intelligent_load_controller.async_unregister_services",
            new=MagicMock(),
        ) as unregister_services,
        patch(
            "custom_components.intelligent_load_controller.async_register_websocket_api",
            new=MagicMock(),
        ) as register_websocket,
        patch(
            "custom_components.intelligent_load_controller.async_unregister_websocket_api",
            new=MagicMock(),
        ) as unregister_websocket,
        patch(
            "custom_components.intelligent_load_controller.async_register_panel",
            new=AsyncMock(),
        ) as register_panel,
        patch(
            "custom_components.intelligent_load_controller.async_remove_panel_if_unused",
            new=MagicMock(),
        ) as remove_panel,
        patch.object(SiteCoordinator, "async_start", start),
        patch.object(SiteCoordinator, "async_stop", stop),
    ):
        assert await async_setup(hass, {})
        assert await async_setup_entry(hass, load_control_config_entry)

        runtime = hass.data[DOMAIN]["runtimes"][load_control_config_entry.entry_id]
        assert isinstance(runtime, SiteCoordinator)
        start.assert_awaited_once_with()
        assert register_services.await_count == 2
        assert register_websocket.call_count == 2
        register_panel.assert_awaited_once_with(hass)
        forward_platforms.assert_awaited_once()

        assert await async_unload_entry(hass, load_control_config_entry)
        stop.assert_awaited_once_with()
        unload_platforms.assert_awaited_once()
        unregister_services.assert_called_once_with(hass)
        unregister_websocket.assert_called_once_with(hass)
        remove_panel.assert_called_once_with(hass)

    assert load_control_config_entry.entry_id not in hass.data[DOMAIN]["runtimes"]
    service_call.assert_not_awaited()


async def test_services_are_restored_when_a_site_is_reloaded_after_last_unload(
    hass,
    load_control_config_entry,
    runtime_store,
    monkeypatch,
) -> None:
    """Global actions survive a config-entry reload in the same HA process."""

    hass.data[DOMAIN] = {DATA_RUNTIME: runtime_store, "runtimes": {}}
    forward_platforms = AsyncMock()
    unload_platforms = AsyncMock(return_value=True)
    monkeypatch.setattr(hass.config_entries, "async_forward_entry_setups", forward_platforms)
    monkeypatch.setattr(hass.config_entries, "async_unload_platforms", unload_platforms)

    with (
        patch.object(SiteCoordinator, "async_start", new=AsyncMock()),
        patch.object(SiteCoordinator, "async_stop", new=AsyncMock()),
        patch(
            "custom_components.intelligent_load_controller.async_register_panel",
            new=AsyncMock(),
        ),
        patch("custom_components.intelligent_load_controller.async_remove_panel_if_unused"),
    ):
        assert await async_setup(hass, {})
        assert hass.services.has_service(DOMAIN, SERVICE_REPLAN)

        assert await async_setup_entry(hass, load_control_config_entry)
        assert await async_unload_entry(hass, load_control_config_entry)
        assert not hass.services.has_service(DOMAIN, SERVICE_REPLAN)

        assert await async_setup_entry(hass, load_control_config_entry)
        assert hass.services.has_service(DOMAIN, SERVICE_REPLAN)


async def test_entry_removal_discards_only_its_bounded_recovery_state(
    hass,
    load_control_config_entry,
    monkeypatch,
) -> None:
    """Deleting a site cannot leave its persisted override/accounting state behind."""

    store = RuntimeStore(hass)
    remove_site = AsyncMock()
    monkeypatch.setattr(store, "async_remove_site", remove_site)
    hass.data[DOMAIN] = {DATA_RUNTIME: store, "runtimes": {}}

    await async_remove_entry(hass, load_control_config_entry)

    remove_site.assert_awaited_once_with(load_control_config_entry.entry_id)


async def test_load_entities_are_registered_against_their_config_subentry(
    hass,
    load_control_config_entry,
    load_config,
    runtime_store,
) -> None:
    """HA can remove a deleted load's entity/device registry records precisely."""

    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    await coordinator.async_start()
    created = await coordinator.async_add_load(load_config)
    load_id = created["load_id"]
    subentry = next(iter(load_control_config_entry.subentries.values()))
    load_control_config_entry.runtime_data = coordinator

    calls: list[tuple[tuple[Entity, ...], str | None]] = []

    def async_add_entities(
        new_entities: Iterable[Entity],
        update_before_add: bool = False,
        *,
        config_subentry_id: str | None = None,
    ) -> None:
        del update_before_add
        calls.append((tuple(new_entities), config_subentry_id))

    for setup_platform in (
        binary_sensor.async_setup_entry,
        button.async_setup_entry,
        number.async_setup_entry,
        select.async_setup_entry,
        sensor.async_setup_entry,
        switch.async_setup_entry,
    ):
        calls.clear()
        await setup_platform(hass, load_control_config_entry, async_add_entities)

        load_calls = [
            entities for entities, subentry_id in calls if subentry_id == subentry.subentry_id
        ]
        assert load_calls
        assert all(
            isinstance(entity, LoadControlEntity) for entities in load_calls for entity in entities
        )
        assert {
            entity.load_id
            for entities in load_calls
            for entity in entities
            if isinstance(entity, LoadControlEntity) and entity.load_id is not None
        } == {load_id}
        assert all(
            all(getattr(entity, "load_id", None) is None for entity in entities)
            for entities, subentry_id in calls
            if subentry_id is None
        )


async def test_panel_registers_as_a_custom_panel_with_local_bundle(hass, monkeypatch) -> None:
    """Register the sidebar item through HA's custom-panel contract."""

    hass.data[DOMAIN] = {"runtimes": {"site-1": object()}}
    register_static_paths = AsyncMock()
    register_panel = MagicMock()
    monkeypatch.setattr(
        hass,
        "http",
        SimpleNamespace(async_register_static_paths=register_static_paths),
        raising=False,
    )

    with patch(
        "custom_components.intelligent_load_controller.panel.frontend.async_register_built_in_panel",
        new=register_panel,
    ):
        await async_register_panel(hass)

    register_static_paths.assert_awaited_once()
    register_panel.assert_called_once_with(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL_PATH,
        config={
            "_panel_custom": {
                "name": PANEL_TAG,
                "module_url": PANEL_MODULE_URL,
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=False,
    )
