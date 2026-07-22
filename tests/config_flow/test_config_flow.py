"""Native Home Assistant configuration and subentry-flow coverage."""

from __future__ import annotations

import pytest

pytest.importorskip("homeassistant", reason="requires the Home Assistant test harness")
pytest.importorskip(
    "pytest_homeassistant_custom_component",
    reason="requires pytest-homeassistant-custom-component",
)

from homeassistant.config_entries import SOURCE_RECONFIGURE, SOURCE_USER
from homeassistant.data_entry_flow import FlowResultType

from custom_components.intelligent_load_controller.const import (
    CONFIG_SCHEMA_VERSION,
    DOMAIN,
    LOAD_SUBENTRY_TYPE,
)

pytestmark = pytest.mark.usefixtures("enable_custom_integrations")


async def test_user_flow_recovers_from_invalid_input_and_creates_site(hass) -> None:
    """A user can correct invalid input without restarting the flow."""

    result = await hass.config_entries.flow.async_init(
        DOMAIN,
        context={"source": SOURCE_USER},
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"site_name": "   "},
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "invalid_name"}

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {"site_name": "Main Switchboard"},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Main Switchboard"
    assert result["data"]["schema_version"] == CONFIG_SCHEMA_VERSION
    assert result["data"]["site_id"]
    assert result["options"]["site_name"] == "Main Switchboard"
    assert result["options"]["config_revision"] == 0


async def test_options_flow_validates_and_increments_site_revision(
    hass,
    load_control_config_entry,
) -> None:
    """Native options use the same schema and preserve revision semantics."""

    result = await hass.config_entries.options.async_init(load_control_config_entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "init"

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            "site_name": "Renamed Site",
            "grid_sign_convention": "export_positive",
            "hard_import_limit_w": 7500,
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"]["site_name"] == "Renamed Site"
    assert result["data"]["grid_sign_convention"] == "export_positive"
    assert result["data"]["hard_import_limit_w"] == 7500
    assert result["data"]["config_revision"] == 1


async def test_load_subentry_user_and_reconfigure_flows_share_validation(
    hass,
    load_control_config_entry,
) -> None:
    """Load subentries gain UUIDs on create and revisions on reconfigure."""

    result = await hass.config_entries.subentries.async_init(
        (load_control_config_entry.entry_id, LOAD_SUBENTRY_TYPE),
        context={"source": SOURCE_USER},
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "display_name": "Pool Pump",
            "load_type": "generic_binary",
            "expected_power_w": 1100,
            "optimisation_mode": "solar_surplus_only",
            "automatic_control": True,
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Pool Pump"
    assert result["unique_id"]
    await hass.async_block_till_done()

    subentry = next(iter(load_control_config_entry.subentries.values()))
    assert subentry.subentry_type == LOAD_SUBENTRY_TYPE
    assert subentry.data["load_id"] == result["unique_id"]
    assert subentry.data["config_revision"] == 0

    result = await hass.config_entries.subentries.async_init(
        (load_control_config_entry.entry_id, LOAD_SUBENTRY_TYPE),
        context={"source": SOURCE_RECONFIGURE, "subentry_id": subentry.subentry_id},
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "reconfigure"

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "display_name": "Pool Pump Updated",
            "load_type": "generic_binary",
            "expected_power_w": 1250,
            "optimisation_mode": "cheapest_tariff",
            "automatic_control": False,
        },
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    await hass.async_block_till_done()

    updated = load_control_config_entry.subentries[subentry.subentry_id]
    assert updated.title == "Pool Pump Updated"
    assert updated.data["config_revision"] == 1
    assert updated.data["automatic_control"] is False
