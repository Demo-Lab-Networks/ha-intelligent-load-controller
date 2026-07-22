"""Versioned, permissioned WebSocket API for the bundled panel."""

from __future__ import annotations

import csv
import io
from collections.abc import Awaitable, Callable, Mapping
from datetime import UTC, datetime, timedelta
from time import monotonic
from typing import Any, Final

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import DATA_WEBSOCKET_REGISTERED, DOMAIN, UPDATE_SIGNAL, WEBSOCKET_PREFIX
from .coordinator import ConfigConflictError, LoadNotFoundError, SiteCoordinator, get_coordinator
from .schema import ConfigurationValidationError, serialize_issues

_RuntimeAction = Callable[[SiteCoordinator], Awaitable[Any]]
_RATE_LIMITS: Final[dict[str, float]] = {
    "configuration_preview": 1.0,
    "historical_summary": 0.5,
    "csv_export": 2.0,
    "diagnostics": 2.0,
    "replan": 1.0,
}


def _type(name: str) -> str:
    return f"{WEBSOCKET_PREFIX}/{name}"


def _error(connection: ActiveConnection, msg: dict[str, Any], code: str, message: str) -> None:
    connection.send_error(msg["id"], code, message)


async def _execute(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
    action: _RuntimeAction,
    *,
    admin: bool = False,
    rate_key: str | None = None,
) -> Any | None:
    """Authorize, resolve runtime, and map expected failures to stable errors."""

    if connection.user is None or not connection.user.is_active:
        _error(connection, msg, "unauthenticated", "An active Home Assistant user is required.")
        return None
    if admin and not connection.user.is_admin:
        _error(connection, msg, "forbidden", "Administrator permission is required.")
        return None
    if rate_key is not None and not _consume_rate_limit(hass, connection, msg, rate_key):
        _error(
            connection, msg, "rate_limited", "Please wait briefly before repeating this request."
        )
        return None
    try:
        runtime = get_coordinator(hass, msg["entry_id"])
        return await action(runtime)
    except (KeyError, LoadNotFoundError):
        _error(connection, msg, "not_found", "The requested site or load was not found.")
    except ConfigConflictError:
        _error(
            connection,
            msg,
            "config_conflict",
            "Configuration changed in another session. Refresh and retry.",
        )
    except ConfigurationValidationError as err:
        _error(connection, msg, "invalid_config", str(serialize_issues(err)))
    except ValueError as err:
        _error(connection, msg, "invalid_request", str(err))
    return None


def _consume_rate_limit(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: Mapping[str, Any],
    rate_key: str,
) -> bool:
    """Apply a bounded per-user/site rate limit to expensive panel requests."""

    interval = _RATE_LIMITS.get(rate_key, 0)
    if interval <= 0:
        return True
    user_id = getattr(connection.user, "id", "anonymous")
    key = (str(user_id), str(msg.get("entry_id", "")), rate_key)
    now = monotonic()
    buckets = hass.data.setdefault(DOMAIN, {}).setdefault("websocket_rate_limits", {})
    previous = buckets.get(key)
    if isinstance(previous, int | float) and now - previous < interval:
        return False
    buckets[key] = now
    # Bound a long-running HA process even if users/sites are churned.
    if len(buckets) > 1024:
        cutoff = now - max(_RATE_LIMITS.values(), default=1) * 4
        for stale_key, stamp in list(buckets.items()):
            if not isinstance(stamp, int | float) or stamp < cutoff:
                buckets.pop(stale_key, None)
    return True


def _entry_schema(command: str, extra: Mapping[Any, Any] | None = None) -> dict[Any, Any]:
    """Build a Voluptuous command schema without abusing Python keyword keys."""

    schema: dict[Any, Any] = {vol.Required("type"): command, vol.Required("entry_id"): str}
    if extra:
        schema.update(extra)
    return schema


@websocket_api.websocket_command(_entry_schema(_type("site_summary")))
@websocket_api.async_response
async def ws_site_summary(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(hass, connection, msg, lambda runtime: runtime.async_site_summary())
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): _type("site_list")})
@websocket_api.async_response
async def ws_site_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """List only configured Load Control sites so the global panel can select one."""

    if connection.user is None or not connection.user.is_active:
        _error(connection, msg, "unauthenticated", "An active Home Assistant user is required.")
        return
    runtimes = hass.data.get(DOMAIN, {}).get("runtimes", {})
    summaries = [await runtime.async_site_summary() for _, runtime in sorted(runtimes.items())]
    connection.send_result(msg["id"], {"sites": summaries})


@websocket_api.websocket_command(_entry_schema(_type("load_list")))
@websocket_api.async_response
async def ws_load_list(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(hass, connection, msg, lambda runtime: runtime.async_load_list())
    if result is not None:
        connection.send_result(msg["id"], {"loads": result})


@websocket_api.websocket_command(
    _entry_schema(_type("load_detail"), {vol.Required("load_id"): str})
)
@websocket_api.async_response
async def ws_load_detail(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass, connection, msg, lambda runtime: runtime.async_load_detail(msg["load_id"])
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(_entry_schema(_type("current_plan")))
@websocket_api.async_response
async def ws_current_plan(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass, connection, msg, lambda runtime: runtime.async_export_decision_report()
    )
    if result is not None:
        connection.send_result(msg["id"], result.get("plan"))


@websocket_api.websocket_command(_entry_schema(_type("daily_timeline")))
@websocket_api.async_response
async def ws_daily_timeline(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass, connection, msg, lambda runtime: runtime.async_export_decision_report()
    )
    if result is not None:
        plan = result.get("plan") or {}
        connection.send_result(
            msg["id"],
            {"intervals": plan.get("intervals", []), "generated_at": plan.get("generated_at")},
        )


@websocket_api.websocket_command(_entry_schema(_type("historical_summary")))
@websocket_api.async_response
async def ws_historical_summary(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_historical_summary(),
        rate_key="historical_summary",
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(_type("event_journal"), {vol.Optional("load_id"): str})
)
@websocket_api.async_response
async def ws_event_journal(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_export_decision_report(msg.get("load_id")),
    )
    if result is not None:
        connection.send_result(msg["id"], {"events": result["events"]})


@websocket_api.websocket_command(_entry_schema(_type("configuration_schema")))
@websocket_api.async_response
async def ws_configuration_schema(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass, connection, msg, lambda runtime: runtime.async_configuration_read(), admin=True
    )
    if result is not None:
        connection.send_result(msg["id"], result["schema"])


@websocket_api.websocket_command(_entry_schema(_type("configuration_read")))
@websocket_api.async_response
async def ws_configuration_read(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass, connection, msg, lambda runtime: runtime.async_configuration_read(), admin=True
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(_type("configuration_validate"), {vol.Required("payload"): dict})
)
@websocket_api.async_response
async def ws_configuration_validate(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_validate_configuration(msg["payload"]),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(_type("configuration_preview"), {vol.Required("payload"): dict})
)
@websocket_api.async_response
async def ws_configuration_preview(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_preview(msg["payload"]),
        admin=True,
        rate_key="configuration_preview",
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(
        _type("configuration_update"),
        {vol.Required("config"): dict, vol.Required("if_revision"): vol.Coerce(int)},
    )
)
@websocket_api.async_response
async def ws_configuration_update(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_update_site_config(msg["config"], msg.get("if_revision")),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(_entry_schema(_type("load_add"), {vol.Required("config"): dict}))
@websocket_api.async_response
async def ws_load_add(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass, connection, msg, lambda runtime: runtime.async_add_load(msg["config"]), admin=True
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(
        _type("load_update"),
        {
            vol.Required("load_id"): str,
            vol.Required("config"): dict,
            vol.Required("if_revision"): vol.Coerce(int),
        },
    )
)
@websocket_api.async_response
async def ws_load_update(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_update_load(
            msg["load_id"], msg["config"], msg.get("if_revision")
        ),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(
        _type("load_duplicate"),
        {
            vol.Required("load_id"): str,
            vol.Required("if_revision"): vol.Coerce(int),
            vol.Optional("display_name"): str,
        },
    )
)
@websocket_api.async_response
async def ws_load_duplicate(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_duplicate_load(
            msg["load_id"], msg.get("if_revision"), msg.get("display_name")
        ),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(
        _type("load_delete"),
        {vol.Required("load_id"): str, vol.Required("if_revision"): vol.Coerce(int)},
    )
)
@websocket_api.async_response
async def ws_load_delete(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_delete_load(msg["load_id"], msg.get("if_revision")),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], {"deleted": True})


@websocket_api.websocket_command(
    _entry_schema(
        _type("override_start"),
        {
            vol.Required("load_id"): str,
            vol.Required("desired_state"): vol.In({"on", "off"}),
            vol.Optional("duration_seconds"): vol.Coerce(float),
            vol.Optional("expires_at"): str,
            vol.Optional("indefinite", default=False): bool,
        },
    )
)
@websocket_api.async_response
async def ws_override_start(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    async def _start(runtime: SiteCoordinator) -> Any:
        expires_at = datetime.fromisoformat(msg["expires_at"]) if msg.get("expires_at") else None
        duration = (
            timedelta(seconds=msg["duration_seconds"])
            if msg.get("duration_seconds") is not None
            else None
        )
        return await runtime.async_start_override(
            msg["load_id"],
            msg["desired_state"],
            duration=duration,
            expires_at=expires_at,
            indefinite=msg["indefinite"],
        )

    result = await _execute(
        hass,
        connection,
        msg,
        _start,
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(_type("override_clear"), {vol.Required("load_id"): str})
)
@websocket_api.async_response
async def ws_override_clear(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_clear_override(msg["load_id"]),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], {"cleared": True})


@websocket_api.websocket_command(
    _entry_schema(
        _type("automatic_control_set"),
        {
            vol.Required("load_id"): str,
            vol.Required("enabled"): bool,
            vol.Required("if_revision"): vol.Coerce(int),
        },
    )
)
@websocket_api.async_response
async def ws_automatic_control_set(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Set automatic authority without exposing direct uncontrolled actuation."""

    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_set_automatic_control(
            msg["load_id"], msg["enabled"], msg.get("if_revision")
        ),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(
        _type("actuator_test_start"),
        {
            vol.Required("load_id"): str,
            vol.Required("duration_seconds"): vol.Coerce(float),
            vol.Required("confirmed"): bool,
        },
    )
)
@websocket_api.async_response
async def ws_actuator_test_start(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Start an explicit bounded test after the panel warning/confirmation."""

    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_start_actuator_test(
            msg["load_id"], duration_seconds=msg["duration_seconds"], confirmed=msg["confirmed"]
        ),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(_type("actuator_test_stop"), {vol.Required("load_id"): str})
)
@websocket_api.async_response
async def ws_actuator_test_stop(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Immediately stop an active bounded actuator test."""

    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_stop_actuator_test(msg["load_id"]),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(_entry_schema(_type("replan"), {vol.Optional("load_id"): str}))
@websocket_api.async_response
async def ws_replan(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_replan(reason="websocket"),
        admin=True,
        rate_key="replan",
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(_entry_schema(_type("csv_export")))
@websocket_api.async_response
async def ws_csv_export(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_export_decision_report(),
        rate_key="csv_export",
    )
    if result is None:
        return
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(
        stream, fieldnames=["timestamp", "load_id", "state", "reason_code", "message"]
    )
    writer.writeheader()
    writer.writerows(result["events"])
    connection.send_result(
        msg["id"],
        {
            "filename": f"load-control-{datetime.now(UTC).date().isoformat()}.csv",
            "content_type": "text/csv",
            "content": stream.getvalue(),
        },
    )


@websocket_api.websocket_command(
    _entry_schema(_type("diagnostics"), {vol.Optional("load_id"): str})
)
@websocket_api.async_response
async def ws_diagnostics(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_export_decision_report(msg.get("load_id")),
        admin=True,
        rate_key="diagnostics",
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(_type("learning_status"), {vol.Optional("load_id"): str})
)
@websocket_api.async_response
async def ws_learning_status(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_learning_status(msg.get("load_id")),
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    _entry_schema(_type("learning_reset"), {vol.Required("load_id"): str})
)
@websocket_api.async_response
async def ws_learning_reset(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_reset_learning(msg["load_id"]),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], {"reset": True})


@websocket_api.websocket_command(
    _entry_schema(
        _type("learning_freeze"), {vol.Required("load_id"): str, vol.Required("frozen"): bool}
    )
)
@websocket_api.async_response
async def ws_learning_freeze(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Freeze/resume bounded local learning without changing hard limits."""

    result = await _execute(
        hass,
        connection,
        msg,
        lambda runtime: runtime.async_set_learning_frozen(msg["load_id"], msg["frozen"]),
        admin=True,
    )
    if result is not None:
        connection.send_result(msg["id"], result)


@callback
@websocket_api.websocket_command(_entry_schema(_type("subscribe_updates")))
def ws_subscribe_updates(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]
) -> None:
    """Subscribe a signed-in panel to scoped updates for one site only."""

    if connection.user is None or not connection.user.is_active:
        _error(connection, msg, "unauthenticated", "An active Home Assistant user is required.")
        return
    try:
        get_coordinator(hass, msg["entry_id"])
    except KeyError:
        _error(connection, msg, "not_found", "The requested site was not found.")
        return

    async def send_update() -> None:
        runtime = get_coordinator(hass, msg["entry_id"])
        connection.send_event(msg["id"], await runtime.async_site_summary())

    def trigger_update() -> None:
        hass.async_create_task(send_update(), f"{DOMAIN}_panel_update")

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(
        hass, f"{UPDATE_SIGNAL}_{msg['entry_id']}", trigger_update
    )
    connection.send_result(msg["id"])


def async_register_websocket_api(hass: HomeAssistant) -> None:
    """Register all versioned commands exactly once for this HA process."""

    domain_data = hass.data.setdefault(DOMAIN, {})
    if domain_data.get(DATA_WEBSOCKET_REGISTERED):
        return
    for handler in (
        ws_site_list,
        ws_site_summary,
        ws_load_list,
        ws_load_detail,
        ws_current_plan,
        ws_daily_timeline,
        ws_historical_summary,
        ws_event_journal,
        ws_configuration_schema,
        ws_configuration_read,
        ws_configuration_validate,
        ws_configuration_preview,
        ws_configuration_update,
        ws_load_add,
        ws_load_update,
        ws_load_duplicate,
        ws_load_delete,
        ws_override_start,
        ws_override_clear,
        ws_automatic_control_set,
        ws_actuator_test_start,
        ws_actuator_test_stop,
        ws_replan,
        ws_csv_export,
        ws_diagnostics,
        ws_learning_status,
        ws_learning_reset,
        ws_learning_freeze,
        ws_subscribe_updates,
    ):
        websocket_api.async_register_command(hass, handler)
    domain_data[DATA_WEBSOCKET_REGISTERED] = True


def async_unregister_websocket_api(hass: HomeAssistant) -> None:
    """Keep registered handlers process-wide; they safely return not_found when unloaded.

    Home Assistant's public WebSocket extension API intentionally has no command
    unregister operation. Retaining schemas is safe and avoids private API use.
    """

    return None
