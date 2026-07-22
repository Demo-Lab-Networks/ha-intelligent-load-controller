"""Native UI flows for sites and load config subentries."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from uuid import uuid4

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryFlow,
    OptionsFlow,
    SubentryFlowResult,
)
from homeassistant.core import callback

from .const import (
    CONFIG_ENTRY_MINOR_VERSION,
    CONFIG_ENTRY_VERSION,
    CONFIG_SCHEMA_VERSION,
    DOMAIN,
    LOAD_SUBENTRY_TYPE,
    LOAD_TYPES,
    OPTIMISATION_MODES,
)
from .schema import (
    ConfigurationValidationError,
    validate_load_config,
    validate_site_config,
    validate_unique_actuator_bindings,
)


def _site_form(defaults: Mapping[str, Any] | None = None) -> vol.Schema:
    defaults = defaults or {}
    return vol.Schema(
        {
            vol.Required("site_name", default=defaults.get("site_name", "Load Control")): str,
        }
    )


def _options_form(defaults: Mapping[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required("site_name", default=defaults["site_name"]): str,
            vol.Required("grid_sign_convention", default=defaults["grid_sign_convention"]): vol.In(
                ["import_positive", "export_positive"]
            ),
            vol.Optional(
                "hard_import_limit_w", default=defaults.get("hard_import_limit_w")
            ): vol.Any(None, vol.Coerce(float)),
        }
    )


def _load_form(defaults: Mapping[str, Any] | None = None) -> vol.Schema:
    defaults = defaults or {}
    return vol.Schema(
        {
            vol.Required("display_name", default=defaults.get("display_name", "New load")): str,
            vol.Required("load_type", default=defaults.get("load_type", "generic_binary")): vol.In(
                sorted(LOAD_TYPES)
            ),
            vol.Optional(
                "expected_power_w", default=defaults.get("expected_power_w", 0)
            ): vol.Coerce(float),
            vol.Required(
                "optimisation_mode",
                default=defaults.get("optimisation_mode", "cost_optimised_hybrid"),
            ): vol.In(sorted(OPTIMISATION_MODES)),
            vol.Required(
                "automatic_control", default=defaults.get("automatic_control", True)
            ): bool,
        }
    )


def _validate_site_load_bindings(
    entry: ConfigEntry,
    candidate: Mapping[str, Any],
    *,
    exclude_subentry_id: str | None = None,
) -> None:
    """Apply the canonical per-site actuator ownership rule in native flows."""

    configs: list[dict[str, Any]] = []
    for subentry_id, subentry in entry.subentries.items():
        if subentry.subentry_type != LOAD_SUBENTRY_TYPE or subentry_id == exclude_subentry_id:
            continue
        try:
            configs.append(validate_load_config(subentry.data))
        except ConfigurationValidationError:
            # Invalid legacy drafts have no active adapter authority. Their
            # repair path will undergo this same check once valid.
            continue
    configs.append(dict(candidate))
    validate_unique_actuator_bindings(configs)


class IntelligentLoadControllerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Manage the one-site-per-entry setup flow."""

    VERSION = CONFIG_ENTRY_VERSION
    MINOR_VERSION = CONFIG_ENTRY_MINOR_VERSION

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Create a site entry with identity in data and settings in options."""

        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                options = validate_site_config(user_input)
            except ConfigurationValidationError:
                errors["base"] = "invalid_name"
            else:
                site_id = str(uuid4())
                await self.async_set_unique_id(site_id)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=options["site_name"],
                    data={"site_id": site_id, "schema_version": CONFIG_SCHEMA_VERSION},
                    options=options,
                )
        return self.async_show_form(step_id="user", data_schema=_site_form(), errors=errors)

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Reconfigure the minimal native-flow site identity safely."""

        entry = self._get_reconfigure_entry()
        current = validate_site_config(entry.options or {})
        errors: dict[str, str] = {}
        if user_input is not None:
            candidate = dict(current)
            candidate.update(user_input)
            candidate["config_revision"] = current["config_revision"] + 1
            try:
                options = validate_site_config(candidate)
            except ConfigurationValidationError:
                errors["base"] = "invalid_name"
            else:
                return self.async_update_reload_and_abort(
                    entry, title=options["site_name"], options=options
                )
        return self.async_show_form(
            step_id="reconfigure", data_schema=_site_form(current), errors=errors
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry) -> OptionsFlow:
        """Return options flow."""

        return IntelligentLoadControllerOptionsFlow(config_entry)

    @classmethod
    @callback
    def async_get_supported_subentry_types(
        cls, config_entry
    ) -> dict[str, type[ConfigSubentryFlow]]:
        """Expose native add/reconfigure flows for every controlled load."""

        return {LOAD_SUBENTRY_TYPE: LoadSubentryFlow}


class IntelligentLoadControllerOptionsFlow(OptionsFlow):
    """Edit mutable site configuration through native Home Assistant UI."""

    def __init__(self, config_entry) -> None:
        self._entry = config_entry

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Show common site options; advanced UI lives in the bundled panel."""

        current = validate_site_config(self._entry.options or {})
        errors: dict[str, str] = {}
        if user_input is not None:
            candidate = dict(current)
            candidate.update(user_input)
            candidate["config_revision"] = current["config_revision"] + 1
            try:
                return self.async_create_entry(title="", data=validate_site_config(candidate))
            except ConfigurationValidationError:
                errors["base"] = "invalid_name"
        return self.async_show_form(
            step_id="init", data_schema=_options_form(current), errors=errors
        )


class LoadSubentryFlow(ConfigSubentryFlow):
    """Native user and reconfigure flows for a load config subentry."""

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        """Create a stable load subentry."""

        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                config = validate_load_config(user_input, create_id=True)
                _validate_site_load_bindings(self._get_entry(), config)
            except ConfigurationValidationError:
                errors["base"] = "invalid_name"
            else:
                return self.async_create_entry(
                    title=config["display_name"],
                    data=config,
                    unique_id=config["load_id"],
                )
        return self.async_show_form(step_id="user", data_schema=_load_form(), errors=errors)

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Update one existing load through the same validator as the panel."""

        subentry = self._get_reconfigure_subentry()
        current = validate_load_config(subentry.data)
        errors: dict[str, str] = {}
        if user_input is not None:
            candidate = dict(current)
            candidate.update(user_input)
            candidate["config_revision"] = current["config_revision"] + 1
            try:
                config = validate_load_config(candidate)
                _validate_site_load_bindings(
                    self._get_entry(), config, exclude_subentry_id=subentry.subentry_id
                )
            except ConfigurationValidationError:
                errors["base"] = "invalid_name"
            else:
                return self.async_update_and_abort(
                    self._get_entry(),
                    subentry,
                    title=config["display_name"],
                    data=config,
                )
        return self.async_show_form(
            step_id="reconfigure", data_schema=_load_form(current), errors=errors
        )
