"""Versioned, bounded runtime persistence for safe recovery."""

from __future__ import annotations

from collections.abc import Mapping
from copy import deepcopy
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DEFAULT_DECISION_JOURNAL_LIMIT, RUNTIME_STORE_KEY, RUNTIME_STORE_VERSION


class RuntimeStore:
    """Store only information required to safely recover controller state."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store = Store[dict[str, Any]](hass, RUNTIME_STORE_VERSION, RUNTIME_STORE_KEY)
        self._data: dict[str, Any] = {"sites": {}}

    async def async_load(self) -> None:
        """Load data, accepting absent or malformed legacy state safely."""

        data = await self._store.async_load()
        if isinstance(data, Mapping) and isinstance(data.get("sites"), Mapping):
            self._data = deepcopy(dict(data))

    def get_site(self, entry_id: str) -> dict[str, Any]:
        """Return an isolated copy of one site's recovery state."""

        site = self._data.setdefault("sites", {}).setdefault(entry_id, self._empty_site())
        return deepcopy(site)

    async def async_save_site(self, entry_id: str, state: Mapping[str, Any]) -> None:
        """Persist a sanitized, bounded site recovery state."""

        normalized = deepcopy(dict(state))
        journal = normalized.get("decision_journal")
        if isinstance(journal, list):
            limit = int(normalized.get("decision_journal_limit", DEFAULT_DECISION_JOURNAL_LIMIT))
            normalized["decision_journal"] = journal[-max(1, min(limit, 5000)) :]
        self._data.setdefault("sites", {})[entry_id] = normalized
        await self._store.async_save(self._data)

    async def async_remove_site(self, entry_id: str) -> None:
        """Remove recovery data after a config entry is deleted."""

        self._data.setdefault("sites", {}).pop(entry_id, None)
        await self._store.async_save(self._data)

    @staticmethod
    def _empty_site() -> dict[str, Any]:
        return {
            "schema_version": RUNTIME_STORE_VERSION,
            "overrides": {},
            "load_runtime": {},
            "decision_journal": [],
            "learning": {},
            "daily_summaries": {},
            "last_plan": None,
        }
