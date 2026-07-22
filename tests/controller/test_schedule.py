"""DST and local-wall-clock schedule tests."""

from __future__ import annotations

import unittest
from datetime import UTC, date, datetime, time

from custom_components.intelligent_load_controller.controller.models import ScheduleWindow
from custom_components.intelligent_load_controller.controller.schedule import (
    ScheduleBoundary,
    interval_for_local_date,
    is_active_at,
    resolve_local_datetime,
)


class ScheduleTests(unittest.TestCase):
    def test_fall_back_uses_first_start_and_second_end(self) -> None:
        start = resolve_local_datetime(
            date(2026, 11, 1), time(1, 30), "America/New_York", boundary=ScheduleBoundary.START
        )
        end = resolve_local_datetime(
            date(2026, 11, 1), time(1, 30), "America/New_York", boundary=ScheduleBoundary.END
        )
        self.assertEqual(start, datetime(2026, 11, 1, 5, 30, tzinfo=UTC))
        self.assertEqual(end, datetime(2026, 11, 1, 6, 30, tzinfo=UTC))

    def test_spring_gap_advances_to_first_valid_instant(self) -> None:
        resolved = resolve_local_datetime(
            date(2026, 3, 8), time(2, 30), "America/New_York", boundary=ScheduleBoundary.START
        )
        self.assertEqual(resolved, datetime(2026, 3, 8, 7, 0, tzinfo=UTC))

    def test_sydney_overlap_uses_the_same_explicit_boundary_policy(self) -> None:
        start = resolve_local_datetime(
            date(2026, 4, 5), time(2, 30), "Australia/Sydney", boundary=ScheduleBoundary.START
        )
        end = resolve_local_datetime(
            date(2026, 4, 5), time(2, 30), "Australia/Sydney", boundary=ScheduleBoundary.END
        )
        self.assertEqual((end - start).total_seconds(), 3_600)

    def test_brisbane_overnight_window_crosses_midnight(self) -> None:
        window = ScheduleWindow("overnight", frozenset({2}), time(22, 0), time(6, 0))
        interval = interval_for_local_date(window, date(2026, 7, 1), "Australia/Brisbane")
        assert interval is not None
        self.assertTrue(
            is_active_at(datetime(2026, 7, 1, 15, 0, tzinfo=UTC), "Australia/Brisbane", (window,))
        )
        self.assertFalse(
            is_active_at(datetime(2026, 7, 1, 10, 0, tzinfo=UTC), "Australia/Brisbane", (window,))
        )
