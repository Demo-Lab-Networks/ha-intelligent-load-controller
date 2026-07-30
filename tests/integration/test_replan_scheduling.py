"""Thread-safe, debounced replan scheduling."""

from __future__ import annotations

import asyncio
import threading
from unittest.mock import AsyncMock

import pytest

pytest.importorskip("homeassistant", reason="requires the Home Assistant test harness")
pytest.importorskip(
    "pytest_homeassistant_custom_component",
    reason="requires pytest-homeassistant-custom-component",
)

from custom_components.intelligent_load_controller.coordinator import SiteCoordinator

pytestmark = pytest.mark.usefixtures("enable_custom_integrations")


async def test_schedule_replan_from_async_context_coalesces_requests(
    hass,
    load_control_config_entry,
    runtime_store,
    monkeypatch,
) -> None:
    """Loop-originated replan requests still debounce into one task."""

    loop_thread = threading.get_ident()
    create_task_threads: list[int] = []
    original_create_task = hass.async_create_task
    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    coordinator._started = True  # noqa: SLF001 - isolate the scheduler contract.

    def tracking_create_task(target, *args, **kwargs):
        create_task_threads.append(threading.get_ident())
        return original_create_task(target, *args, **kwargs)

    replan = AsyncMock()
    monkeypatch.setattr(hass, "async_create_task", tracking_create_task)
    monkeypatch.setattr(coordinator, "async_replan", replan)

    coordinator._schedule_replan("input_changed")  # noqa: SLF001
    coordinator._schedule_replan("input_changed")  # noqa: SLF001
    coordinator._schedule_replan("input_changed")  # noqa: SLF001

    await asyncio.sleep(0)

    assert create_task_threads == [loop_thread]
    assert coordinator._replan_task is not None  # noqa: SLF001
    assert not coordinator._replan_task.done()  # noqa: SLF001

    await asyncio.sleep(1.1)
    await hass.async_block_till_done()

    replan.assert_awaited_once_with(reason="input_changed")


async def test_schedule_replan_from_executor_marshals_to_event_loop(
    hass,
    load_control_config_entry,
    runtime_store,
    monkeypatch,
) -> None:
    """Sync/executor callers never call Home Assistant task APIs off-loop."""

    loop_thread = threading.get_ident()
    create_task_threads: list[int] = []
    original_create_task = hass.async_create_task
    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    coordinator._started = True  # noqa: SLF001 - isolate the scheduler contract.

    def tracking_create_task(target, *args, **kwargs):
        create_task_threads.append(threading.get_ident())
        return original_create_task(target, *args, **kwargs)

    replan = AsyncMock()
    monkeypatch.setattr(hass, "async_create_task", tracking_create_task)
    monkeypatch.setattr(coordinator, "async_replan", replan)

    def schedule_from_worker() -> None:
        for _ in range(8):
            coordinator._schedule_replan("input_changed")  # noqa: SLF001

    await hass.async_add_executor_job(schedule_from_worker)
    await asyncio.sleep(0)

    assert create_task_threads == [loop_thread]
    assert coordinator._replan_task is not None  # noqa: SLF001
    assert not coordinator._replan_task.done()  # noqa: SLF001

    await asyncio.sleep(1.1)
    await hass.async_block_till_done()

    replan.assert_awaited_once_with(reason="input_changed")


async def test_unload_ignores_pending_replan_callbacks(
    hass,
    load_control_config_entry,
    runtime_store,
    monkeypatch,
) -> None:
    """A queued thread-safe callback cannot create a task after unload."""

    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    coordinator._started = True  # noqa: SLF001 - simulate a started coordinator.
    replan = AsyncMock()
    monkeypatch.setattr(coordinator, "async_replan", replan)

    coordinator._schedule_replan("input_changed")  # noqa: SLF001
    await coordinator.async_stop()
    await hass.async_block_till_done()

    assert coordinator._replan_task is None  # noqa: SLF001
    replan.assert_not_awaited()


async def test_unload_cancels_pending_replan_task(
    hass,
    load_control_config_entry,
    runtime_store,
    monkeypatch,
) -> None:
    """Unload/reload cannot leave a debounced replan task running."""

    coordinator = SiteCoordinator(hass, load_control_config_entry, runtime_store)
    coordinator._started = True  # noqa: SLF001 - isolate the scheduler contract.
    replan = AsyncMock()
    monkeypatch.setattr(coordinator, "async_replan", replan)

    coordinator._async_schedule_replan_on_loop("input_changed")  # noqa: SLF001
    task = coordinator._replan_task  # noqa: SLF001
    assert isinstance(task, asyncio.Task)
    assert not task.done()

    await coordinator.async_stop()
    await hass.async_block_till_done()

    assert coordinator._replan_task is None  # noqa: SLF001
    assert task.cancelled()
    replan.assert_not_awaited()
