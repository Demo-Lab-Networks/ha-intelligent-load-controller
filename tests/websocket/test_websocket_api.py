"""Versioned WebSocket registration, authentication, and permission tests."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from types import SimpleNamespace
from typing import Any, cast
from unittest.mock import MagicMock

import pytest

pytest.importorskip("homeassistant", reason="requires the Home Assistant test harness")
pytest.importorskip(
    "pytest_homeassistant_custom_component",
    reason="requires pytest-homeassistant-custom-component",
)

from homeassistant.setup import async_setup_component

from custom_components.intelligent_load_controller import websocket_api as load_control_websocket
from custom_components.intelligent_load_controller.const import (
    DATA_WEBSOCKET_REGISTERED,
    DOMAIN,
    WEBSOCKET_PREFIX,
)
from custom_components.intelligent_load_controller.coordinator import SiteCoordinator

pytestmark = pytest.mark.usefixtures("enable_custom_integrations")


class FakeConnection:
    """Minimal connection surface for direct authentication/permission guards."""

    def __init__(self, user) -> None:
        self.user = user
        self.send_error = MagicMock()
        self.send_result = MagicMock()


AsyncResponseHandler = Callable[[Any, Any, dict[str, Any]], Awaitable[None]]


def _async_response_handler(handler: object) -> AsyncResponseHandler:
    """Return the coroutine retained by HA's ``async_response`` decorator."""

    return cast(AsyncResponseHandler, cast(Any, handler).__wrapped__)


@pytest.fixture
async def registered_runtime(hass, load_control_config_entry, runtime_store):
    """Start a safe in-memory runtime and register its WebSocket commands."""

    runtime = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    await runtime.async_start()
    hass.data.setdefault(DOMAIN, {})["runtimes"] = {load_control_config_entry.entry_id: runtime}
    assert await async_setup_component(hass, "websocket_api", {})
    load_control_websocket.async_register_websocket_api(hass)
    return runtime


def test_command_registration_is_idempotent(hass, monkeypatch) -> None:
    """All panel command families register once per Home Assistant process."""

    register_command = MagicMock()
    monkeypatch.setattr(
        load_control_websocket.websocket_api,
        "async_register_command",
        register_command,
    )

    load_control_websocket.async_register_websocket_api(hass)
    registered_names = {call.args[1].__name__ for call in register_command.call_args_list}
    assert {
        "ws_site_list",
        "ws_site_summary",
        "ws_load_list",
        "ws_configuration_read",
        "ws_override_start",
        "ws_learning_reset",
    } <= registered_names
    first_count = register_command.call_count

    load_control_websocket.async_register_websocket_api(hass)
    assert register_command.call_count == first_count
    assert hass.data[DOMAIN][DATA_WEBSOCKET_REGISTERED] is True


async def test_site_list_is_available_to_an_authenticated_websocket_client(
    hass,
    hass_ws_client,
    registered_runtime,
) -> None:
    """The global panel can discover its configured site through the v1 API."""

    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{WEBSOCKET_PREFIX}/site_list"})
    response = await client.receive_json()

    assert response["success"] is True
    sites = response["result"]["sites"]
    assert len(sites) == 1
    expected = {
        "entry_id": registered_runtime.entry.entry_id,
        "site_id": "test-site-id",
        "name": "Test Site",
        "config_revision": 0,
        "state": "idle",
        "active_loads": 0,
        "waiting_loads": 0,
        "total_controlled_power_w": 0,
        "next_action": None,
        "last_replan_at": None,
    }
    assert {key: sites[0][key] for key in expected} == expected
    assert isinstance(sites[0]["attention"], list)
    assert sites[0]["attention_count"] == len(sites[0]["attention"])
    for item in sites[0]["attention"]:
        assert {"id", "code", "rank", "severity", "affected_kind", "reason_code", "action"} <= set(
            item
        )
        assert isinstance(item["rank"], int)
        assert item["severity"] in {"critical", "warning", "info"}
        assert item["action"] in {"settings", "diagnostics", "load_detail"}


async def test_websocket_rejects_unauthenticated_and_non_admin_requests(hass) -> None:
    """Read commands require an active user; configuration requires an admin."""

    unauthenticated = FakeConnection(user=None)
    await _async_response_handler(load_control_websocket.ws_site_list)(
        hass,
        unauthenticated,
        {"id": 1},
    )
    unauthenticated.send_error.assert_called_once()
    assert unauthenticated.send_error.call_args.args[1] == "unauthenticated"

    read_only = FakeConnection(user=SimpleNamespace(is_active=True, is_admin=False))
    await _async_response_handler(load_control_websocket.ws_configuration_read)(
        hass,
        read_only,
        {"id": 2, "entry_id": "missing"},
    )
    read_only.send_error.assert_called_once()
    assert read_only.send_error.call_args.args[1] == "forbidden"
