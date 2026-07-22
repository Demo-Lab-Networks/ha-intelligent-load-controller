"""Constants for Intelligent Load Controller."""

from __future__ import annotations

from typing import Final

from homeassistant.const import Platform

DOMAIN: Final = "intelligent_load_controller"
NAME: Final = "Intelligent Load Controller"
SHORT_NAME: Final = "Load Control"

CONFIG_ENTRY_VERSION: Final = 1
CONFIG_ENTRY_MINOR_VERSION: Final = 1
CONFIG_SCHEMA_VERSION: Final = 1
RUNTIME_STORE_VERSION: Final = 1
RUNTIME_STORE_KEY: Final = f"{DOMAIN}.runtime"

MINIMUM_HOME_ASSISTANT_VERSION: Final = "2025.4.0"
PANEL_URL_PATH: Final = "intelligent-load-controller"
PANEL_TITLE: Final = "Load Control"
PANEL_ICON: Final = "mdi:transmission-tower"
PANEL_TAG: Final = "intelligent-load-controller-panel"
PANEL_MODULE_URL: Final = f"/{DOMAIN}/intelligent-load-controller.js"
PANEL_STATIC_PATH: Final = f"/{DOMAIN}"

LOAD_SUBENTRY_TYPE: Final = "load"
DATA_RUNTIME: Final = "runtime"
DATA_PANEL_REGISTERED: Final = "panel_registered"
DATA_SERVICES_REGISTERED: Final = "services_registered"
DATA_WEBSOCKET_REGISTERED: Final = "websocket_registered"

UPDATE_SIGNAL: Final = f"{DOMAIN}_updated"

PLATFORMS: Final = (
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.SENSOR,
    Platform.SWITCH,
)

SERVICE_START_OVERRIDE: Final = "start_override"
SERVICE_CLEAR_OVERRIDE: Final = "clear_override"
SERVICE_SET_AUTOMATIC_CONTROL: Final = "set_automatic_control"
SERVICE_REPLAN: Final = "replan"
SERVICE_SKIP_OPERATIONAL_DAY: Final = "skip_operational_day"
SERVICE_RESET_DAILY_ACCOUNTING: Final = "reset_daily_accounting"
SERVICE_EXPORT_DECISION_REPORT: Final = "export_decision_report"

WEBSOCKET_PREFIX: Final = f"{DOMAIN}/v1"

DEFAULT_OPERATIONAL_DAY_BOUNDARY: Final = "00:00"
DEFAULT_PLANNING_HORIZON_HOURS: Final = 24
DEFAULT_PLANNING_RESOLUTION_SECONDS: Final = 300
DEFAULT_DECISION_JOURNAL_LIMIT: Final = 500
DEFAULT_SENSOR_STALE_SECONDS: Final = 900
DEFAULT_REPLAN_DEBOUNCE_SECONDS: Final = 1

LOAD_TYPES: Final = {
    "hot_water",
    "generic_binary",
    "binary_ev",
    "variable_ev",
    "battery_charger",
    "battery_load",
    "action_pair",
}

OPTIMISATION_MODES: Final = {
    "disabled",
    "manual",
    "schedule_only",
    "solar_surplus_only",
    "free_energy_only",
    "cheapest_tariff",
    "solar_preferred_guarantee",
    "cost_optimised_hybrid",
    "custom_priority",
}

PHASE_ASSIGNMENTS: Final = {"a", "b", "c", "unknown", "three_phase"}
GRID_SIGN_CONVENTIONS: Final = {"import_positive", "export_positive"}
