"""Shared fixtures for Home Assistant integration tests.

These fixtures intentionally avoid importing Home Assistant at collection time so
the pure-controller tests can still run in a lightweight Python environment.
The integration-specific modules call ``pytest.importorskip`` before requesting
the Home Assistant fixtures.
"""

from __future__ import annotations

from copy import deepcopy
from typing import Any

import pytest


class MemoryRuntimeStore:
    """Small in-memory substitute for the bounded Home Assistant runtime store."""

    def __init__(self) -> None:
        self.sites: dict[str, dict[str, Any]] = {}

    def get_site(self, entry_id: str) -> dict[str, Any]:
        return deepcopy(self.sites.get(entry_id, {}))

    async def async_save_site(self, entry_id: str, state: dict[str, Any]) -> None:
        self.sites[entry_id] = deepcopy(state)

    async def async_remove_site(self, entry_id: str) -> None:
        self.sites.pop(entry_id, None)


@pytest.fixture
def site_options() -> dict[str, Any]:
    """Return the smallest valid site options payload for a test entry."""

    return {
        "site_name": "Test Site",
        "grid_sign_convention": "import_positive",
    }


@pytest.fixture
def load_config() -> dict[str, Any]:
    """Return the smallest valid generic-binary load payload."""

    return {
        "display_name": "Test Load",
        "load_type": "generic_binary",
        "expected_power_w": 1200,
        "optimisation_mode": "cost_optimised_hybrid",
        "automatic_control": True,
    }


@pytest.fixture
def runtime_store() -> MemoryRuntimeStore:
    """Provide isolated persistence without using Home Assistant disk storage."""

    return MemoryRuntimeStore()


@pytest.fixture
def load_control_config_entry(hass, site_options: dict[str, Any]):
    """Add one unconfigured Load Control entry to the Home Assistant harness."""

    pytest.importorskip("pytest_homeassistant_custom_component")
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    from custom_components.intelligent_load_controller.const import DOMAIN

    entry = MockConfigEntry(
        domain=DOMAIN,
        title=site_options["site_name"],
        data={"site_id": "test-site-id", "schema_version": 1},
        options=site_options,
    )
    entry.add_to_hass(hass)
    return entry
