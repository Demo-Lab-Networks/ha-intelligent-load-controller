"""Timezone-safe weekly schedules and operational-day helpers.

The controller stores recurring schedules as local wall-clock values but stores
every resulting instant in UTC.  ``zoneinfo`` deliberately permits both folds
of ambiguous times, so this module makes the product policy explicit:

* a start during a fall-back overlap uses the first occurrence;
* an end during an overlap uses the second occurrence; and
* a spring-forward gap advances to the next valid local instant.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta
from enum import Enum
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from .models import ScheduleWindow, as_utc


class ScheduleBoundary(str, Enum):
    START = "start"
    END = "end"


@dataclass(frozen=True, slots=True)
class ScheduleInterval:
    window: ScheduleWindow
    start_at: datetime
    end_at: datetime

    def __post_init__(self) -> None:
        start = as_utc(self.start_at, field_name="start_at")
        end = as_utc(self.end_at, field_name="end_at")
        if end <= start:
            raise ValueError("schedule interval end must follow its start")
        object.__setattr__(self, "start_at", start)
        object.__setattr__(self, "end_at", end)

    def contains(self, at: datetime) -> bool:
        instant = as_utc(at, field_name="at")
        return self.start_at <= instant < self.end_at


@dataclass(frozen=True, slots=True)
class OperationalDay:
    """The UTC bounds of a local civil day, including 23/25-hour DST days."""

    local_date: date
    start_at: datetime
    end_at: datetime

    def __post_init__(self) -> None:
        start = as_utc(self.start_at, field_name="start_at")
        end = as_utc(self.end_at, field_name="end_at")
        if end <= start:
            raise ValueError("operational day must have positive duration")
        object.__setattr__(self, "start_at", start)
        object.__setattr__(self, "end_at", end)


def get_timezone(timezone_name: str) -> ZoneInfo:
    """Resolve and validate an IANA timezone string with a useful error."""

    try:
        return ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError as err:
        raise ValueError(f"unknown IANA timezone {timezone_name!r}") from err


def resolve_local_datetime(
    local_date: date,
    local_time: time,
    timezone: str | ZoneInfo,
    *,
    boundary: ScheduleBoundary = ScheduleBoundary.START,
) -> datetime:
    """Resolve a local wall time to the policy-selected UTC instant.

    A nonexistent local time is advanced one local minute at a time to the first
    representable time.  Modern IANA gaps are minute-aligned and the generous
    two-day guard also covers unusual historical transitions without looping
    forever on invalid timezone data.
    """

    if local_time.tzinfo is not None:
        raise ValueError("local_time must be timezone-naive")
    zone = get_timezone(timezone) if isinstance(timezone, str) else timezone
    local = datetime.combine(local_date, local_time)
    candidates = _valid_candidates(local, zone)
    for _ in range(2 * 24 * 60 + 1):
        if candidates:
            selected = (
                min(candidates, key=lambda candidate: candidate.astimezone(UTC))
                if boundary is ScheduleBoundary.START
                else max(candidates, key=lambda candidate: candidate.astimezone(UTC))
            )
            return selected.astimezone(UTC)
        # Move to the next exact local minute.  Keeping seconds/microseconds
        # would turn a nonexistent 02:30:45 into 03:00:45, not the first valid
        # local instant after the DST gap.
        local = local.replace(second=0, microsecond=0) + timedelta(minutes=1)
        candidates = _valid_candidates(local, zone)
    raise ValueError(f"could not resolve local time {local_date} {local_time} in {zone.key}")


def _valid_candidates(local: datetime, zone: ZoneInfo) -> tuple[datetime, ...]:
    """Return valid aware candidates, omitting zoneinfo's imaginary datetimes."""

    candidates: dict[datetime, datetime] = {}
    for fold in (0, 1):
        candidate = local.replace(tzinfo=zone, fold=fold)
        round_trip = candidate.astimezone(UTC).astimezone(zone)
        if round_trip.replace(tzinfo=None) == local:
            candidates[candidate.astimezone(UTC)] = candidate
    return tuple(candidates[instant] for instant in sorted(candidates))


def interval_for_local_date(
    window: ScheduleWindow,
    start_date: date,
    timezone: str | ZoneInfo,
) -> ScheduleInterval | None:
    """Build a concrete interval when ``window`` begins on ``start_date``."""

    if start_date.weekday() not in window.weekdays:
        return None
    zone = get_timezone(timezone) if isinstance(timezone, str) else timezone
    start_at = resolve_local_datetime(
        start_date, window.start, zone, boundary=ScheduleBoundary.START
    )
    end_date = start_date + timedelta(days=1) if window.is_overnight else start_date
    end_at = resolve_local_datetime(end_date, window.end, zone, boundary=ScheduleBoundary.END)
    return ScheduleInterval(window=window, start_at=start_at, end_at=end_at)


def intervals_near(
    at: datetime,
    timezone: str | ZoneInfo,
    windows: tuple[ScheduleWindow, ...],
) -> tuple[ScheduleInterval, ...]:
    """Return intervals starting yesterday, today, and tomorrow in local time."""

    instant = as_utc(at, field_name="at")
    zone = get_timezone(timezone) if isinstance(timezone, str) else timezone
    local_date = instant.astimezone(zone).date()
    intervals: list[ScheduleInterval] = []
    for offset in (-1, 0, 1):
        candidate_date = local_date + timedelta(days=offset)
        for window in windows:
            interval = interval_for_local_date(window, candidate_date, zone)
            if interval is not None:
                intervals.append(interval)
    return tuple(sorted(intervals, key=lambda interval: (interval.start_at, interval.window.name)))


def is_active_at(
    at: datetime,
    timezone: str | ZoneInfo,
    windows: tuple[ScheduleWindow, ...],
) -> bool:
    """Whether any supplied schedule window contains the instant."""

    if not windows:
        return True
    return any(interval.contains(at) for interval in intervals_near(at, timezone, windows))


def active_windows_at(
    at: datetime,
    timezone: str | ZoneInfo,
    windows: tuple[ScheduleWindow, ...],
) -> tuple[ScheduleWindow, ...]:
    """Return the concrete windows that contain an instant."""

    return tuple(
        interval.window
        for interval in intervals_near(at, timezone, windows)
        if interval.contains(at)
    )


def next_transition_at(
    at: datetime,
    timezone: str | ZoneInfo,
    windows: tuple[ScheduleWindow, ...],
    *,
    lookahead_days: int = 8,
) -> datetime | None:
    """Find the next start/end transition in a bounded weekly schedule search."""

    if lookahead_days < 1:
        raise ValueError("lookahead_days must be at least one")
    instant = as_utc(at, field_name="at")
    zone = get_timezone(timezone) if isinstance(timezone, str) else timezone
    today = instant.astimezone(zone).date()
    candidates: list[datetime] = []
    for offset in range(-1, lookahead_days + 1):
        candidate_date = today + timedelta(days=offset)
        for window in windows:
            interval = interval_for_local_date(window, candidate_date, zone)
            if interval is not None:
                candidates.extend((interval.start_at, interval.end_at))
    future = [candidate for candidate in candidates if candidate > instant]
    return min(future) if future else None


def operational_day_for(at: datetime, timezone: str | ZoneInfo) -> OperationalDay:
    """Return local midnight-to-midnight bounds for the instant's civil day."""

    instant = as_utc(at, field_name="at")
    zone = get_timezone(timezone) if isinstance(timezone, str) else timezone
    local_date = instant.astimezone(zone).date()
    return operational_day_bounds(local_date, zone)


def operational_day_bounds(local_date: date, timezone: str | ZoneInfo) -> OperationalDay:
    """Return local midnight bounds under the same deterministic DST policy."""

    zone = get_timezone(timezone) if isinstance(timezone, str) else timezone
    midnight = time(0, 0)
    start = resolve_local_datetime(local_date, midnight, zone, boundary=ScheduleBoundary.START)
    end = resolve_local_datetime(
        local_date + timedelta(days=1), midnight, zone, boundary=ScheduleBoundary.START
    )
    return OperationalDay(local_date=local_date, start_at=start, end_at=end)
