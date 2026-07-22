"""Home Assistant actions for safe manual control and reporting."""

from __future__ import annotations

from datetime import datetime

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from .const import (
    DATA_SERVICES_REGISTERED,
    DOMAIN,
    SERVICE_CLEAR_OVERRIDE,
    SERVICE_EXPORT_DECISION_REPORT,
    SERVICE_REPLAN,
    SERVICE_RESET_DAILY_ACCOUNTING,
    SERVICE_SET_AUTOMATIC_CONTROL,
    SERVICE_SKIP_OPERATIONAL_DAY,
    SERVICE_START_OVERRIDE,
)
from .coordinator import ConfigConflictError, LoadNotFoundError, get_coordinator

_ENTRY_AND_LOAD_SCHEMA = {
    vol.Required("entry_id"): cv.string,
    vol.Required("load_id"): cv.string,
}


def _translate_error(err: Exception) -> HomeAssistantError:
    if isinstance(err, KeyError | LoadNotFoundError):
        return HomeAssistantError("Unknown Load Control site or load")
    if isinstance(err, ConfigConflictError):
        return HomeAssistantError("Configuration changed; refresh and try again")
    if isinstance(err, ValueError):
        return HomeAssistantError(str(err))
    return HomeAssistantError("Load Control action could not be completed")


async def async_register_services(hass: HomeAssistant) -> None:
    """Register stable actions once, regardless of number of site entries."""

    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get(DATA_SERVICES_REGISTERED):
        return

    async def start_override(call: ServiceCall) -> None:
        try:
            expires_at = call.data.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            await get_coordinator(hass, call.data["entry_id"]).async_start_override(
                call.data["load_id"],
                call.data["desired_state"],
                duration=call.data.get("duration"),
                expires_at=expires_at,
                indefinite=call.data.get("indefinite", False),
            )
        except Exception as err:  # Home Assistant service boundary
            raise _translate_error(err) from err

    async def clear_override(call: ServiceCall) -> None:
        try:
            await get_coordinator(hass, call.data["entry_id"]).async_clear_override(
                call.data["load_id"]
            )
        except Exception as err:
            raise _translate_error(err) from err

    async def set_automatic_control(call: ServiceCall) -> None:
        try:
            await get_coordinator(hass, call.data["entry_id"]).async_set_automatic_control(
                call.data["load_id"], call.data["enabled"]
            )
        except Exception as err:
            raise _translate_error(err) from err

    async def replan(call: ServiceCall) -> None:
        try:
            coordinator = get_coordinator(hass, call.data["entry_id"])
            load_id = call.data.get("load_id")
            if load_id is not None:
                coordinator._find_load(load_id)  # noqa: SLF001 - validates the scoped action target
            await coordinator.async_replan(reason="service_load" if load_id else "service")
        except Exception as err:
            raise _translate_error(err) from err

    async def skip_operational_day(call: ServiceCall) -> None:
        try:
            await get_coordinator(hass, call.data["entry_id"]).async_skip_operational_day(
                call.data["load_id"]
            )
        except Exception as err:
            raise _translate_error(err) from err

    async def reset_daily_accounting(call: ServiceCall) -> None:
        try:
            await get_coordinator(hass, call.data["entry_id"]).async_reset_daily_accounting(
                confirmed=call.data["confirmed"]
            )
        except Exception as err:
            raise _translate_error(err) from err

    async def export_decision_report(call: ServiceCall) -> None:
        try:
            report = await get_coordinator(
                hass, call.data["entry_id"]
            ).async_export_decision_report(call.data.get("load_id"))
            hass.bus.async_fire(f"{DOMAIN}_decision_report_exported", report)
        except Exception as err:
            raise _translate_error(err) from err

    hass.services.async_register(
        DOMAIN,
        SERVICE_START_OVERRIDE,
        start_override,
        schema=vol.Schema(
            _ENTRY_AND_LOAD_SCHEMA
            | {
                vol.Required("desired_state"): vol.In({"on", "off"}),
                vol.Optional("duration"): cv.time_period,
                vol.Optional("expires_at"): vol.Any(cv.datetime, str),
                vol.Optional("indefinite", default=False): cv.boolean,
            }
        ),
    )
    hass.services.async_register(
        DOMAIN, SERVICE_CLEAR_OVERRIDE, clear_override, schema=vol.Schema(_ENTRY_AND_LOAD_SCHEMA)
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_AUTOMATIC_CONTROL,
        set_automatic_control,
        schema=vol.Schema(_ENTRY_AND_LOAD_SCHEMA | {vol.Required("enabled"): cv.boolean}),
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REPLAN,
        replan,
        schema=vol.Schema(
            {vol.Required("entry_id"): cv.string, vol.Optional("load_id"): cv.string}
        ),
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SKIP_OPERATIONAL_DAY,
        skip_operational_day,
        schema=vol.Schema(_ENTRY_AND_LOAD_SCHEMA),
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_RESET_DAILY_ACCOUNTING,
        reset_daily_accounting,
        schema=vol.Schema(
            {vol.Required("entry_id"): cv.string, vol.Required("confirmed"): cv.boolean}
        ),
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_EXPORT_DECISION_REPORT,
        export_decision_report,
        schema=vol.Schema(
            {vol.Required("entry_id"): cv.string, vol.Optional("load_id"): cv.string}
        ),
    )
    domain_data[DATA_SERVICES_REGISTERED] = True


def async_unregister_services(hass: HomeAssistant) -> None:
    """Unregister actions only after every site entry is gone."""

    domain_data = hass.data.get(DOMAIN, {})
    if domain_data.get("runtimes") or not domain_data.get(DATA_SERVICES_REGISTERED):
        return
    for service in (
        SERVICE_START_OVERRIDE,
        SERVICE_CLEAR_OVERRIDE,
        SERVICE_SET_AUTOMATIC_CONTROL,
        SERVICE_REPLAN,
        SERVICE_SKIP_OPERATIONAL_DAY,
        SERVICE_RESET_DAILY_ACCOUNTING,
        SERVICE_EXPORT_DECISION_REPORT,
    ):
        hass.services.async_remove(DOMAIN, service)
    domain_data[DATA_SERVICES_REGISTERED] = False
