"""Abstract adapter contract between Home Assistant and the policy engine."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant


class AdapterError(RuntimeError):
    """A safe, bounded error from an actuator adapter."""


@dataclass(frozen=True, slots=True)
class AdapterFeedback:
    """A normalized observed device snapshot; absent values are never invented."""

    observed_at: datetime
    available: bool
    commanded_state: bool | None = None
    confirmed_state: bool | None = None
    active_power_w: float | None = None
    energy_kwh: float | None = None
    temperature_c: float | None = None
    state_of_charge_pct: float | None = None
    connected: bool | None = None
    charging: bool | None = None
    setpoint: float | None = None
    detail: str | None = None

    def __post_init__(self) -> None:
        if self.observed_at.tzinfo is None:
            object.__setattr__(self, "observed_at", self.observed_at.replace(tzinfo=UTC))
        else:
            object.__setattr__(self, "observed_at", self.observed_at.astimezone(UTC))


@dataclass(frozen=True, slots=True)
class AdapterCommand:
    """An already-authorized command from the site arbitrator."""

    desired_enabled: bool | None = None
    setpoint: float | None = None
    source: str = "automatic"
    reason_code: str = "plan_selected"


@dataclass(frozen=True, slots=True)
class AdapterTestResult:
    """Auditable result of an explicitly-confirmed bounded actuator test."""

    started_at: datetime
    ended_at: datetime
    stopped: bool
    detail: str


class LoadAdapter(ABC):
    """Base class used by the application boundary only after authorization."""

    def __init__(self, hass: HomeAssistant, config: dict[str, Any]) -> None:
        self.hass = hass
        self.config = dict(config)

    @abstractmethod
    async def async_observe(self) -> AdapterFeedback:
        """Read feedback only; this method must not issue a command."""

    @abstractmethod
    async def async_apply(self, command: AdapterCommand) -> AdapterFeedback:
        """Apply a previously-authorized command and return fresh observation."""

    async def async_test(self, *, duration_seconds: float, confirmed: bool) -> AdapterTestResult:
        """Run a deliberately bounded test only after an explicit confirmation."""

        if not confirmed:
            raise AdapterError("Actuator test requires explicit confirmation")
        if not 1 <= duration_seconds <= 300:
            raise AdapterError("Actuator test duration must be between 1 and 300 seconds")
        started_at = datetime.now(UTC)
        await self.async_apply(
            AdapterCommand(
                desired_enabled=True, source="manual_test", reason_code="manual_actuator_test"
            )
        )
        # Delays are intentionally owned by the application layer in real UI
        # execution so an immediate stop can interrupt them. This base class
        # never sleeps or silently schedules a future hardware action.
        await self.async_apply(
            AdapterCommand(
                desired_enabled=False,
                source="manual_test",
                reason_code="manual_actuator_test_complete",
            )
        )
        return AdapterTestResult(
            started_at=started_at,
            ended_at=datetime.now(UTC),
            stopped=True,
            detail=(
                "Actuator test started and immediately stopped; timed execution is managed by "
                "the coordinator."
            ),
        )
