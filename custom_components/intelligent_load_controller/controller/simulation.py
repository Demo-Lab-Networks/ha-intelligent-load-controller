"""Deterministic, pure simulation foundations for controller safety evidence.

The simulator deliberately models only normalised site demand, solar, tariffs,
planning and real-time allocation.  It has no Home Assistant, device, file or
wall-clock dependency.  The CLI wrapper in ``scripts/run_simulation.py`` owns
report-file output.
"""

from __future__ import annotations

import csv
import io
import json
import random
from collections.abc import Iterable
from dataclasses import dataclass, replace
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from math import isfinite

from .accounting import (
    AccountingInterval,
    EnergyProvenance,
    RuntimeAccounting,
    record_interval,
)
from .arbitrator import ArbitrationInput, SiteArbitrator
from .models import (
    ForecastPoint,
    LoadRequest,
    ReasonCode,
    SiteConfigV1,
    SitePowerSnapshot,
    as_decimal,
    as_utc,
)
from .planner import DeterministicPlanner, PlannerSettings, PlanningInput
from .tariff import PriceInterval, TariffTimeline

SIMULATION_VERSION = "1"
_EPSILON = 1e-6


@dataclass(frozen=True, slots=True)
class SimulationScenario:
    """A fully deterministic synthetic site scenario.

    Synthetic values represent a non-production test environment only.  They
    are intentionally specified in the same normalised units as the controller
    inputs, allowing reports to serve as reproducible invariant evidence.
    """

    scenario_id: str
    seed: int
    start_at: datetime
    site: SiteConfigV1
    requests: tuple[LoadRequest, ...]
    duration_s: int = 24 * 60 * 60
    slot_seconds: int = 5 * 60
    base_import_w: float = 2_000.0
    base_variation_w: float = 600.0
    solar_peak_w: float = 6_000.0
    cloudiness: float = 0.25
    input_unavailable_slots: frozenset[int] = frozenset()
    offpeak_price_per_kwh: Decimal = Decimal("0.18")
    shoulder_price_per_kwh: Decimal = Decimal("0.28")
    peak_price_per_kwh: Decimal = Decimal("0.45")
    export_price_per_kwh: Decimal = Decimal("0.08")

    def __post_init__(self) -> None:
        if not self.scenario_id.strip():
            raise ValueError("scenario_id must not be empty")
        object.__setattr__(self, "start_at", as_utc(self.start_at, field_name="start_at"))
        requests = tuple(self.requests)
        if not all(isinstance(request, LoadRequest) for request in requests):
            raise ValueError("requests must contain LoadRequest values")
        request_ids = [request.load_id for request in requests]
        if len(request_ids) != len(set(request_ids)):
            raise ValueError("scenario request IDs must be unique")
        object.__setattr__(self, "requests", requests)
        if self.duration_s <= 0 or self.slot_seconds <= 0 or self.duration_s % self.slot_seconds:
            raise ValueError("duration_s must be a positive multiple of slot_seconds")
        for field_name in ("base_import_w", "base_variation_w", "solar_peak_w"):
            value = float(getattr(self, field_name))
            if not isfinite(value) or value < 0:
                raise ValueError(f"{field_name} must be a finite non-negative number")
            object.__setattr__(self, field_name, value)
        cloudiness = float(self.cloudiness)
        if not isfinite(cloudiness) or not 0 <= cloudiness <= 1:
            raise ValueError("cloudiness must be between zero and one")
        object.__setattr__(self, "cloudiness", cloudiness)
        unavailable = frozenset(int(slot) for slot in self.input_unavailable_slots)
        if any(slot < 0 or slot >= self.slot_count for slot in unavailable):
            raise ValueError("input_unavailable_slots must be within the scenario horizon")
        object.__setattr__(self, "input_unavailable_slots", unavailable)
        for field_name in (
            "offpeak_price_per_kwh",
            "shoulder_price_per_kwh",
            "peak_price_per_kwh",
            "export_price_per_kwh",
        ):
            object.__setattr__(
                self, field_name, as_decimal(getattr(self, field_name), field_name=field_name)
            )

    @property
    def slot_count(self) -> int:
        return self.duration_s // self.slot_seconds

    @property
    def end_at(self) -> datetime:
        return self.start_at + timedelta(seconds=self.duration_s)

    def to_dict(self) -> dict[str, object]:
        """Return redaction-safe normalised scenario input for report evidence."""

        return {
            "scenario_id": self.scenario_id,
            "seed": self.seed,
            "start_at": self.start_at.isoformat(),
            "duration_s": self.duration_s,
            "slot_seconds": self.slot_seconds,
            "site": {
                "site_id": self.site.site_id,
                "timezone": self.site.timezone,
                "currency": self.site.currency,
                "hard_import_limit_w": self.site.hard_import_limit_w,
                "controlled_import_limit_w": self.site.controlled_import_limit_w,
                "phase_hard_limits_w": dict(self.site.phase_hard_limits_w),
                "max_simultaneous_binary_loads": self.site.max_simultaneous_binary_loads,
            },
            "environment": {
                "base_import_w": self.base_import_w,
                "base_variation_w": self.base_variation_w,
                "solar_peak_w": self.solar_peak_w,
                "cloudiness": self.cloudiness,
                "input_unavailable_slots": sorted(self.input_unavailable_slots),
            },
            "tariffs": {
                "offpeak_price_per_kwh": str(self.offpeak_price_per_kwh),
                "shoulder_price_per_kwh": str(self.shoulder_price_per_kwh),
                "peak_price_per_kwh": str(self.peak_price_per_kwh),
                "export_price_per_kwh": str(self.export_price_per_kwh),
            },
            "requests": [
                {
                    "load_id": request.load_id,
                    "requested_power_w": request.requested_power_w,
                    "remaining_energy_wh": request.remaining_energy_wh,
                    "remaining_runtime_s": request.remaining_runtime_s,
                    "earliest_start_at": (
                        request.earliest_start_at.isoformat()
                        if request.earliest_start_at is not None
                        else None
                    ),
                    "deadline_at": (
                        request.deadline_at.isoformat() if request.deadline_at is not None else None
                    ),
                    "mandatory": request.mandatory,
                    "priority": request.priority,
                    "minimum_power_w": request.minimum_power_w,
                    "maximum_power_w": request.maximum_power_w,
                    "phase": request.phase,
                    "control_source": request.control_source.value,
                }
                for request in self.requests
            ],
        }


@dataclass(frozen=True, slots=True)
class SimulationSlot:
    """One reportable simulation tick; no raw entities or sensitive data."""

    at: datetime
    base_import_w: float
    solar_w: float
    planned_w: float
    granted_w: float
    solar_allocated_w: float
    active_load_count: int
    denied_reason_codes: tuple[ReasonCode, ...] = ()
    input_available: bool = True

    def __post_init__(self) -> None:
        object.__setattr__(self, "at", as_utc(self.at, field_name="at"))
        for field_name in (
            "base_import_w",
            "solar_w",
            "planned_w",
            "granted_w",
            "solar_allocated_w",
        ):
            value = float(getattr(self, field_name))
            if not isfinite(value) or value < 0:
                raise ValueError(f"{field_name} must be a finite non-negative number")
            object.__setattr__(self, field_name, value)
        if self.solar_allocated_w > self.granted_w + _EPSILON:
            raise ValueError("solar_allocated_w cannot exceed granted_w")
        if self.active_load_count < 0:
            raise ValueError("active_load_count must be non-negative")
        if not all(isinstance(reason, ReasonCode) for reason in self.denied_reason_codes):
            raise ValueError("denied_reason_codes must contain ReasonCode values")
        object.__setattr__(self, "denied_reason_codes", tuple(self.denied_reason_codes))


@dataclass(frozen=True, slots=True)
class SimulationReport:
    """Scenario output with machine-readable and human-readable renderers."""

    scenario_id: str
    seed: int
    start_at: datetime
    end_at: datetime
    slot_seconds: int
    planned_interval_count: int
    planner_feasible: bool
    expected_cost: Decimal
    actual_cost: Decimal
    commanded_energy_wh: float
    confirmed_energy_wh: float
    denied_allocations: int
    failures: tuple[str, ...]
    slots: tuple[SimulationSlot, ...]
    scenario: SimulationScenario
    version: str = SIMULATION_VERSION

    def __post_init__(self) -> None:
        if not self.scenario_id.strip() or not self.version:
            raise ValueError("scenario_id and version must not be empty")
        start = as_utc(self.start_at, field_name="start_at")
        end = as_utc(self.end_at, field_name="end_at")
        if end <= start:
            raise ValueError("simulation end_at must follow start_at")
        if self.slot_seconds <= 0 or self.planned_interval_count < 0 or self.denied_allocations < 0:
            raise ValueError("simulation counts must be non-negative and slot_seconds positive")
        for field_name in ("commanded_energy_wh", "confirmed_energy_wh"):
            value = float(getattr(self, field_name))
            if not isfinite(value) or value < 0:
                raise ValueError(f"{field_name} must be a finite non-negative number")
            object.__setattr__(self, field_name, value)
        object.__setattr__(self, "start_at", start)
        object.__setattr__(self, "end_at", end)
        object.__setattr__(
            self, "expected_cost", as_decimal(self.expected_cost, field_name="expected_cost")
        )
        object.__setattr__(
            self, "actual_cost", as_decimal(self.actual_cost, field_name="actual_cost")
        )
        object.__setattr__(self, "failures", tuple(sorted(set(self.failures))))
        object.__setattr__(self, "slots", tuple(self.slots))

    @property
    def passed(self) -> bool:
        return not self.failures

    def to_dict(self, *, include_slots: bool = True) -> dict[str, object]:
        result: dict[str, object] = {
            "version": self.version,
            "scenario_id": self.scenario_id,
            "seed": self.seed,
            "start_at": self.start_at.isoformat(),
            "end_at": self.end_at.isoformat(),
            "slot_seconds": self.slot_seconds,
            "passed": self.passed,
            "planner_feasible": self.planner_feasible,
            "planned_interval_count": self.planned_interval_count,
            "expected_cost": str(self.expected_cost),
            "actual_cost": str(self.actual_cost),
            "commanded_energy_wh": self.commanded_energy_wh,
            "confirmed_energy_wh": self.confirmed_energy_wh,
            "denied_allocations": self.denied_allocations,
            "failures": list(self.failures),
            "scenario": self.scenario.to_dict(),
        }
        if include_slots:
            result["slots"] = [
                {
                    "at": slot.at.isoformat(),
                    "base_import_w": slot.base_import_w,
                    "solar_w": slot.solar_w,
                    "planned_w": slot.planned_w,
                    "granted_w": slot.granted_w,
                    "solar_allocated_w": slot.solar_allocated_w,
                    "active_load_count": slot.active_load_count,
                    "input_available": slot.input_available,
                    "denied_reason_codes": [reason.value for reason in slot.denied_reason_codes],
                }
                for slot in self.slots
            ]
        return result

    def to_json(self, *, include_slots: bool = True) -> str:
        return (
            json.dumps(self.to_dict(include_slots=include_slots), indent=2, sort_keys=True) + "\n"
        )

    def to_markdown(self) -> str:
        status = "PASS" if self.passed else "FAIL"
        lines = [
            f"# Simulation: {self.scenario_id}",
            "",
            f"**Status:** {status}  ",
            f"**Version/seed:** {self.version} / {self.seed}  ",
            f"**Window:** {self.start_at.isoformat()} to {self.end_at.isoformat()}",
            f"**Site/load count:** {self.scenario.site.site_id} / {len(self.scenario.requests)}",
            "",
            "| Metric | Value |",
            "| --- | ---: |",
            f"| Planner feasible | {self.planner_feasible} |",
            f"| Planned intervals | {self.planned_interval_count} |",
            f"| Commanded energy | {self.commanded_energy_wh:.3f} Wh |",
            f"| Confirmed energy | {self.confirmed_energy_wh:.3f} Wh |",
            f"| Expected cost | {self.expected_cost} |",
            f"| Actual cost | {self.actual_cost} |",
            f"| Denied allocations | {self.denied_allocations} |",
        ]
        if self.failures:
            lines.extend(["", "## Invariant failures", ""])
            lines.extend(f"- {failure}" for failure in self.failures)
        return "\n".join(lines) + "\n"

    def to_csv(self) -> str:
        output = io.StringIO(newline="")
        writer = csv.DictWriter(
            output,
            fieldnames=(
                "scenario_id",
                "seed",
                "at",
                "base_import_w",
                "solar_w",
                "planned_w",
                "granted_w",
                "solar_allocated_w",
                "active_load_count",
                "input_available",
                "denied_reason_codes",
            ),
        )
        writer.writeheader()
        for slot in self.slots:
            writer.writerow(
                {
                    "scenario_id": self.scenario_id,
                    "seed": self.seed,
                    "at": slot.at.isoformat(),
                    "base_import_w": slot.base_import_w,
                    "solar_w": slot.solar_w,
                    "planned_w": slot.planned_w,
                    "granted_w": slot.granted_w,
                    "solar_allocated_w": slot.solar_allocated_w,
                    "active_load_count": slot.active_load_count,
                    "input_available": slot.input_available,
                    "denied_reason_codes": ";".join(
                        reason.value for reason in slot.denied_reason_codes
                    ),
                }
            )
        return output.getvalue()


@dataclass(frozen=True, slots=True)
class SimulationSuiteReport:
    reports: tuple[SimulationReport, ...]
    version: str = SIMULATION_VERSION

    def __post_init__(self) -> None:
        reports = tuple(self.reports)
        scenario_ids = [report.scenario_id for report in reports]
        if len(scenario_ids) != len(set(scenario_ids)):
            raise ValueError("simulation reports require unique scenario IDs")
        object.__setattr__(self, "reports", reports)

    @property
    def passed(self) -> bool:
        return all(report.passed for report in self.reports)

    def to_dict(self, *, include_slots: bool = True) -> dict[str, object]:
        return {
            "version": self.version,
            "passed": self.passed,
            "scenario_count": len(self.reports),
            "reports": [report.to_dict(include_slots=include_slots) for report in self.reports],
        }

    def to_json(self, *, include_slots: bool = True) -> str:
        return (
            json.dumps(self.to_dict(include_slots=include_slots), indent=2, sort_keys=True) + "\n"
        )

    def to_markdown(self) -> str:
        lines = [
            "# Intelligent Load Controller simulation suite",
            "",
            "| Scenario | Status | Planner feasible | Failures |",
            "| --- | --- | --- | ---: |",
        ]
        for report in self.reports:
            status = "PASS" if report.passed else "FAIL"
            lines.append(
                f"| {report.scenario_id} | {status} | "
                f"{report.planner_feasible} | {len(report.failures)} |"
            )
        lines.append("")
        for report in self.reports:
            lines.append(report.to_markdown().rstrip())
            lines.append("")
        return "\n".join(lines)

    def to_csv(self) -> str:
        chunks = [report.to_csv().rstrip("\r\n") for report in self.reports]
        if not chunks:
            return ""
        header, *first_rows = chunks[0].splitlines()
        rows = list(first_rows)
        for chunk in chunks[1:]:
            rows.extend(chunk.splitlines()[1:])
        return "\n".join((header, *rows)) + "\n"


def run_scenario(scenario: SimulationScenario) -> SimulationReport:
    """Run a scenario deterministically and return invariant evidence.

    A plan is generated once over the configured horizon, then every planned
    slot is sent through the real-time arbitrator using synthetic observations.
    This intentionally exercises the separation between proposed planning and
    final automatic authority.
    """

    settings = PlannerSettings(
        slot_seconds=scenario.slot_seconds, horizon_seconds=scenario.duration_s
    )
    environments = _synthetic_environment(scenario)
    forecasts = tuple(
        ForecastPoint(
            at=at,
            solar_generation_w=solar_w,
            base_import_w=base_import_w,
            valid_until_at=at + timedelta(seconds=scenario.slot_seconds),
        )
        for at, base_import_w, solar_w in environments
    )
    tariffs = _synthetic_tariffs(scenario)
    plan = DeterministicPlanner(settings).plan(
        PlanningInput(
            now=scenario.start_at,
            site=scenario.site,
            requests=scenario.requests,
            tariffs=tariffs,
            forecasts=forecasts,
        )
    )
    requests_by_id = {request.load_id: request for request in scenario.requests}
    intervals_by_start: dict[datetime, list[tuple[str, float]]] = {}
    for interval in plan.intervals:
        intervals_by_start.setdefault(interval.start_at, []).append(
            (interval.load_id, interval.power_w)
        )
    planned_slots_by_start = {slot.start_at: slot for slot in plan.slots}

    arbitrator = SiteArbitrator()
    accounting = {request.load_id: RuntimeAccounting() for request in scenario.requests}
    running_power_w = {request.load_id: 0.0 for request in scenario.requests}
    last_automatic_start_at: datetime | None = None
    report_slots: list[SimulationSlot] = []
    failures: list[str] = []
    denied_allocations = 0

    for slot_index, (at, base_import_w, solar_w) in enumerate(environments):
        active_specs = intervals_by_start.get(at, [])
        active_requests = tuple(
            replace(requests_by_id[load_id], current_power_w=running_power_w[load_id])
            for load_id, _ in active_specs
        )
        input_available = slot_index not in scenario.input_unavailable_slots
        allocation_result = arbitrator.arbitrate(
            ArbitrationInput(
                at=at,
                site=scenario.site,
                snapshot=SitePowerSnapshot(
                    at=at,
                    grid_import_w=base_import_w,
                    solar_generation_w=solar_w,
                    available=input_available,
                ),
                requests=active_requests,
                automatic_enabled=True,
                observation_ready=True,
                uncontrolled_import_w=base_import_w,
                available_solar_w=solar_w,
                last_automatic_start_at=last_automatic_start_at,
                max_input_age_s=float(scenario.slot_seconds),
            )
        )
        by_load = {allocation.load_id: allocation for allocation in allocation_result.allocations}
        planned_w = sum(power_w for _, power_w in active_specs)
        denied_codes: list[ReasonCode] = []
        next_running = {request.load_id: 0.0 for request in scenario.requests}
        for load_id, planned_power_w in active_specs:
            allocation = by_load[load_id]
            if not allocation.accepted:
                denied_allocations += 1
                denied_codes.extend(allocation.reasons)
            grant = allocation.granted_w
            next_running[load_id] = grant
            if grant > 0 and running_power_w[load_id] <= 0:
                last_automatic_start_at = at
            tariff = tariffs.at(at)
            if tariff is None:
                failures.append(f"{at.isoformat()}: generated tariff timeline has a gap")
                continue
            duration_s = scenario.slot_seconds
            accounting[load_id] = record_interval(
                accounting[load_id],
                AccountingInterval(
                    start_at=at,
                    end_at=at + timedelta(seconds=duration_s),
                    commanded_power_w=planned_power_w,
                    confirmed_power_w=grant,
                    provenance=EnergyProvenance(
                        grid_wh=max(0.0, grant - allocation.solar_allocated_w) * duration_s / 3600,
                        solar_wh=allocation.solar_allocated_w * duration_s / 3600,
                    ),
                    blocked=grant + _EPSILON < planned_power_w,
                    command_started=grant > 0 and running_power_w[load_id] <= 0,
                ),
                tariff=tariff,
            )
        running_power_w = next_running

        actual_hard_capacity_w = max(
            0.0, scenario.site.hard_import_limit_w - base_import_w + solar_w
        )
        planned_slot = planned_slots_by_start[at]
        _collect_slot_invariants(
            failures=failures,
            at=at,
            planned_w=planned_w,
            planned_capacity_w=planned_slot.capacity_w,
            planned_solar_w=planned_slot.solar_allocated_w,
            actual_granted_w=allocation_result.total_granted_w,
            actual_solar_w=allocation_result.total_solar_allocated_w,
            hard_capacity_w=actual_hard_capacity_w,
            available_solar_w=solar_w,
            input_available=input_available,
        )
        report_slots.append(
            SimulationSlot(
                at=at,
                base_import_w=base_import_w,
                solar_w=solar_w,
                planned_w=planned_w,
                granted_w=allocation_result.total_granted_w,
                solar_allocated_w=allocation_result.total_solar_allocated_w,
                active_load_count=len(active_specs),
                denied_reason_codes=tuple(
                    sorted(set(denied_codes), key=lambda reason: reason.value)
                ),
                input_available=input_available,
            )
        )

    expected_cost = sum((interval.expected_cost for interval in plan.intervals), Decimal("0"))
    actual_cost = sum((value.controlled_cost for value in accounting.values()), Decimal("0"))
    return SimulationReport(
        scenario_id=scenario.scenario_id,
        seed=scenario.seed,
        start_at=scenario.start_at,
        end_at=scenario.end_at,
        slot_seconds=scenario.slot_seconds,
        planned_interval_count=len(plan.intervals),
        planner_feasible=plan.is_feasible,
        expected_cost=expected_cost,
        actual_cost=actual_cost,
        commanded_energy_wh=sum(value.commanded_energy_wh for value in accounting.values()),
        confirmed_energy_wh=sum(value.confirmed_energy_wh for value in accounting.values()),
        denied_allocations=denied_allocations,
        failures=tuple(failures),
        slots=tuple(report_slots),
        scenario=scenario,
    )


def run_suite(scenarios: Iterable[SimulationScenario]) -> SimulationSuiteReport:
    """Run a supplied immutable scenario suite in caller-defined order."""

    return SimulationSuiteReport(tuple(run_scenario(scenario) for scenario in scenarios))


def default_scenarios(*, seed: int = 20260722) -> tuple[SimulationScenario, ...]:
    """Return a compact, deterministic V1 safety smoke suite.

    It covers clear/cloudy/no solar, input failure, and a 20-load competition.
    This is deliberately a simulation foundation—not a substitute for later
    type-specific HWS, EV and battery acceptance simulations.
    """

    start = datetime(2026, 7, 1, tzinfo=UTC)
    return (
        SimulationScenario(
            scenario_id="clear_solar_competition",
            seed=seed,
            start_at=start,
            site=SiteConfigV1("sim-clear", "UTC", "AUD", 10_000, start_stagger_s=0),
            requests=(
                LoadRequest(
                    "hws",
                    3_600,
                    remaining_runtime_s=2 * 3600,
                    deadline_at=start + timedelta(hours=20),
                    priority=90,
                ),
                LoadRequest(
                    "ev",
                    5_000,
                    remaining_runtime_s=4 * 3600,
                    deadline_at=start + timedelta(hours=24),
                    priority=70,
                    minimum_power_w=1_400,
                    maximum_power_w=7_000,
                ),
                LoadRequest(
                    "pool",
                    1_100,
                    remaining_runtime_s=3 * 3600,
                    deadline_at=start + timedelta(hours=18),
                    priority=30,
                ),
            ),
            solar_peak_w=8_000,
            cloudiness=0.05,
        ),
        SimulationScenario(
            scenario_id="cloudy_solar_guarantee",
            seed=seed + 1,
            start_at=start,
            site=SiteConfigV1("sim-cloud", "UTC", "AUD", 7_000, start_stagger_s=0),
            requests=(
                LoadRequest(
                    "hws",
                    3_600,
                    remaining_runtime_s=3 * 3600,
                    deadline_at=start + timedelta(hours=19),
                    mandatory=True,
                ),
                LoadRequest(
                    "ev",
                    3_600,
                    remaining_runtime_s=2 * 3600,
                    deadline_at=start + timedelta(hours=24),
                    priority=50,
                ),
            ),
            base_import_w=2_800,
            solar_peak_w=5_500,
            cloudiness=0.8,
        ),
        SimulationScenario(
            scenario_id="no_solar_deadline",
            seed=seed + 2,
            start_at=start,
            site=SiteConfigV1("sim-night", "UTC", "AUD", 5_000, start_stagger_s=0),
            requests=(
                LoadRequest(
                    "deadline_load",
                    2_000,
                    remaining_runtime_s=2 * 3600,
                    deadline_at=start + timedelta(hours=9),
                    mandatory=True,
                ),
                LoadRequest("deferrable", 1_000, remaining_runtime_s=2 * 3600, priority=10),
            ),
            solar_peak_w=0,
        ),
        SimulationScenario(
            scenario_id="input_outage_fail_closed",
            seed=seed + 3,
            start_at=start,
            site=SiteConfigV1("sim-outage", "UTC", "AUD", 6_000, start_stagger_s=0),
            requests=(
                LoadRequest(
                    "solar_load",
                    2_000,
                    remaining_runtime_s=5 * 3600,
                    deadline_at=start + timedelta(hours=24),
                ),
            ),
            solar_peak_w=5_000,
            input_unavailable_slots=frozenset(range(120, 132)),
        ),
        SimulationScenario(
            scenario_id="twenty_load_arbitration",
            seed=seed + 4,
            start_at=start,
            site=SiteConfigV1("sim-twenty", "UTC", "AUD", 12_000, start_stagger_s=0),
            requests=tuple(
                LoadRequest(
                    load_id=f"load_{index:02d}",
                    requested_power_w=700 + (index % 5) * 450,
                    remaining_runtime_s=(1 + index % 4) * 1_800,
                    deadline_at=start + timedelta(hours=12 + index % 12),
                    mandatory=index < 3,
                    priority=100 - index,
                    fairness_debt=float(index % 3),
                )
                for index in range(20)
            ),
            base_import_w=3_500,
            base_variation_w=1_000,
            solar_peak_w=8_500,
            cloudiness=0.35,
        ),
    )


def run_default_suite(*, seed: int = 20260722) -> SimulationSuiteReport:
    """Run the built-in deterministic safety smoke scenarios."""

    return run_suite(default_scenarios(seed=seed))


def _synthetic_environment(
    scenario: SimulationScenario,
) -> tuple[tuple[datetime, float, float], ...]:
    random_source = random.Random(scenario.seed)
    slots_per_day = max(1, 24 * 60 * 60 // scenario.slot_seconds)
    output: list[tuple[datetime, float, float]] = []
    for index in range(scenario.slot_count):
        at = scenario.start_at + timedelta(seconds=index * scenario.slot_seconds)
        day_slot = index % slots_per_day
        # A triangular daylight profile from 06:00 to 18:00 avoids host locale,
        # time-zone and floating trigonometry variation in test evidence.
        daylight_position = day_slot / slots_per_day
        solar_shape = max(0.0, 1.0 - abs(daylight_position - 0.5) / 0.25)
        cloud_factor = 1.0 - scenario.cloudiness * (random_source.randrange(0, 1001) / 1000)
        solar_w = max(0.0, scenario.solar_peak_w * solar_shape * cloud_factor)
        demand_shape = 1.0 - abs(daylight_position - 0.75) / 0.75
        noise = (random_source.randrange(-1000, 1001) / 1000) * scenario.base_variation_w * 0.2
        base_import_w = max(
            0.0, scenario.base_import_w + scenario.base_variation_w * max(0.0, demand_shape) + noise
        )
        output.append((at, base_import_w, solar_w))
    return tuple(output)


def _synthetic_tariffs(scenario: SimulationScenario) -> TariffTimeline:
    intervals: list[PriceInterval] = []
    for index in range(scenario.slot_count):
        start = scenario.start_at + timedelta(seconds=index * scenario.slot_seconds)
        end = start + timedelta(seconds=scenario.slot_seconds)
        hour = (index * scenario.slot_seconds // 3600) % 24
        if 17 <= hour < 21:
            import_price = scenario.peak_price_per_kwh
        elif 7 <= hour < 17:
            import_price = scenario.shoulder_price_per_kwh
        else:
            import_price = scenario.offpeak_price_per_kwh
        intervals.append(
            PriceInterval(
                start_at=start,
                end_at=end,
                import_price_per_kwh=import_price,
                export_price_per_kwh=scenario.export_price_per_kwh,
            )
        )
    return TariffTimeline(tuple(intervals))


def _collect_slot_invariants(
    *,
    failures: list[str],
    at: datetime,
    planned_w: float,
    planned_capacity_w: float,
    planned_solar_w: float,
    actual_granted_w: float,
    actual_solar_w: float,
    hard_capacity_w: float,
    available_solar_w: float,
    input_available: bool,
) -> None:
    prefix = at.isoformat()
    if planned_w > planned_capacity_w + _EPSILON:
        failures.append(f"{prefix}: planner allocation exceeds slot capacity")
    if planned_solar_w > planned_w + _EPSILON:
        failures.append(f"{prefix}: planner solar allocation exceeds planned power")
    if actual_granted_w > hard_capacity_w + _EPSILON:
        failures.append(f"{prefix}: arbitrator grant exceeds hard site capacity")
    if actual_solar_w > actual_granted_w + _EPSILON:
        failures.append(f"{prefix}: arbitrator solar allocation exceeds granted power")
    if actual_solar_w > available_solar_w + _EPSILON:
        failures.append(f"{prefix}: arbitrator allocated solar more than once")
    if not input_available and actual_granted_w > _EPSILON:
        failures.append(f"{prefix}: stale/missing inputs granted automatic power")
