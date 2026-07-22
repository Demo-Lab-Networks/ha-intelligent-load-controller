"""Clock abstractions used to keep policy evaluation deterministic."""

from __future__ import annotations

import time as _time
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Protocol

from .models import as_utc


class Clock(Protocol):
    """The only wall-clock/monotonic clock dependency allowed in the core."""

    def now(self) -> datetime:
        """Return an aware UTC instant."""

    def monotonic(self) -> float:
        """Return a monotonically increasing seconds value."""


class SystemClock:
    """Production implementation, injected at the application boundary."""

    def now(self) -> datetime:
        return datetime.now(UTC)

    def monotonic(self) -> float:
        return _time.monotonic()


@dataclass(slots=True)
class FixedClock:
    """A deterministic clock for simulator and unit-test use."""

    _now: datetime
    _monotonic: float = 0.0

    def __post_init__(self) -> None:
        self._now = as_utc(self._now, field_name="_now")

    def now(self) -> datetime:
        return self._now

    def monotonic(self) -> float:
        return self._monotonic

    def advance(self, seconds: float) -> None:
        if seconds < 0:
            raise ValueError("FixedClock cannot move backwards")
        self._now += timedelta(seconds=seconds)
        self._monotonic += seconds


@dataclass(frozen=True, slots=True)
class PersistedTimer:
    """A restart-safe timer represented by an absolute UTC anchor.

    Runtime monotonic clocks cannot survive a restart.  Persisting this anchor
    permits the integration to reconstruct elapsed qualification/hold time after
    reload while policy logic remains clock-injected.
    """

    started_at: datetime

    def __post_init__(self) -> None:
        object.__setattr__(self, "started_at", as_utc(self.started_at, field_name="started_at"))

    def elapsed_s(self, clock: Clock) -> float:
        return max(0.0, (clock.now() - self.started_at).total_seconds())

    def elapsed_at(self, at: datetime) -> float:
        return max(0.0, (as_utc(at, field_name="at") - self.started_at).total_seconds())
