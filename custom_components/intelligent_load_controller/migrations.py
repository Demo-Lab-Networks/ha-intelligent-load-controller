"""Configuration/runtime migration helpers with no actuator side effects."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry

from .schema import validate_load_config, validate_site_config


def normalize_site_options(entry: ConfigEntry) -> dict[str, Any]:
    """Normalize legacy site options into the current schema safely."""

    return validate_site_config(entry.options or {})


def normalize_load_data(data: dict[str, Any]) -> dict[str, Any]:
    """Normalize legacy subentry data without executing an action."""

    return validate_load_config(data, create_id=True)
