"""Actionable, localized repair issue helpers."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN


def async_create_configuration_issue(hass: HomeAssistant, entry_id: str, detail: str) -> None:
    """Create a repair issue for unsafe/incomplete integration configuration."""

    ir.async_create_issue(
        hass,
        DOMAIN,
        f"configuration_{entry_id}",
        is_fixable=True,
        severity=ir.IssueSeverity.WARNING,
        translation_key="configuration_invalid",
        translation_placeholders={"detail": detail},
    )


def async_create_runtime_issue(hass: HomeAssistant, entry_id: str, code: str) -> None:
    """Create a repair issue when a safety-critical runtime condition needs action."""

    ir.async_create_issue(
        hass,
        DOMAIN,
        f"{code}_{entry_id}",
        is_fixable=False,
        severity=ir.IssueSeverity.ERROR,
        translation_key="runtime_fault",
        translation_placeholders={"code": code},
    )


def async_delete_issue(hass: HomeAssistant, issue_id: str) -> None:
    """Clear a repair only after the underlying condition has been resolved."""

    ir.async_delete_issue(hass, DOMAIN, issue_id)
