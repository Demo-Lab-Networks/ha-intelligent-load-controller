# Control Model and Safety Architecture

**Status:** Normative architecture baseline
**Applies from:** Phase 2 policy engine; Home Assistant integration boundary arrives in Phase 3.

## Architecture boundary

```text
HA config flows / entities / actions / panel WebSocket / device events
                              │
                    Home Assistant boundary
        validation · lifecycle · storage · entities · permissions
                              │
                  immutable normalized snapshots
                              ▼
                  pure controller engine
   schedule · tariff · state · planner · learning · reason journal
                              │
          requests ◄── site arbitrator ──► allocations / denials
                              │
                    adapter command intents
                              ▼
               HA actions, state feedback, confirmations
```

The pure controller package has no Home Assistant imports, direct device calls, mutable global state, wall-clock calls, or I/O. It takes a supplied clock and immutable snapshots; it returns values and decision records. The application boundary owns polling/subscriptions, validation, persistence, auth, localisation rendering, and actions.

The **site arbitrator** is the only component allowed to authorise an automatic actuator command. A load state machine may request capacity, never grant itself capacity. Manual actions route through the arbitrator too so hard limits remain effective.

## Canonical models

All policy quantities are normalized before entering the engine:

| Concept | Canonical form | Boundary responsibility |
| --- | --- | --- |
| Power / limits | integer watts | Convert HA units, validate freshness and sign convention |
| Energy | integer watt-hours | Convert cumulative counter deltas safely |
| Duration | integer seconds | Preserve timer provenance and monotonic qualifications |
| Instant | UTC-aware `datetime` | Translate from local schedule/deadline definitions |
| Schedule | local timezone + wall-clock window + recurrence | Resolve DST deterministically |
| Cost | `Decimal` currency/kWh | Convert cents/kWh and currency/MWh; reject incompatible units |
| Display | locale-aware strings | Never feed formatted values back into policy |

Core models are frozen, typed value objects (Python `dataclass(frozen=True, slots=True)` or equivalent):

| Model | Essential fields and meaning |
| --- | --- |
| `SiteConfigV1` | ID/revision/schema, timezone, input bindings, tariff/free-window policy, limits/margins/stagger/fairness, retention, feature flags |
| `LoadConfigV1` | Stable UUID/revision/schema, type/display metadata, adapter binding, feedback bindings, phase metadata, constraints, requirements, schedule/mode/priority, Boost/learning/notification policy |
| `SitePowerSnapshot` | observed-at time, aggregate import/export/net, optional solar, A/B/C phase values, battery status, validity/staleness/quality |
| `LoadSnapshot` | observed-at time, actuator/feedback availability and state, power/energy/temperature/SOC, recovery and timer observations |
| `LoadRequest` | desired operating interval/state/setpoint, urgency/deadline, expected power/energy, source eligibility, reason candidates, manual flag |
| `PlanInterval` | UTC start/end, intended state/setpoint, source allocation, expected outputs/cost, reasons, data quality |
| `SiteAllocation` | authorised/rejected/deferred request, watts/setpoint, constraints applied, denial reason, fairness update |
| `DecisionEvent` | timestamp, transition, stable reason code, input snapshot reference, requested/confirmed action, config revision, next action |
| `Override` | type (on/off/auto), mode (timed/indefinite), created-at, absolute UTC expiry if timed, initiator/audit metadata |
| `LearningEstimate` | configured and learned value, bounds, confidence/sample count, last update, source, planner-use flag |
| `ForecastPoint` | UTC start/end, value/unit/source, retrieved-at/valid-until, confidence, quality |

The models are serialisable without HA objects. Entity IDs, action targets, and opaque HA state only exist in adapter/configuration-boundary objects.

## Configuration schema and revisions

A single canonical schema has a site document and versioned `load` subentry document. It is used unchanged by site/load config flows, native reconfiguration, panel validation, preview, WebSocket mutations, migration, and diagnostics. Schema validation checks entity existence/availability/unit/sign, conflicts, limits, schedules, stale inputs, and type-specific constraints. It returns field-level stable error codes and no client-side rule is authoritative.

Every mutable site/load document has a monotonically increasing `revision`. Reads return the revision; writes require `if_revision`. A mismatch yields `config_conflict` with the current revision and never performs a partial merge. Schema migrations are explicit, forward-only, idempotent functions from one numbered version to the next.

## Planning and real-time control

The planner runs a rolling 24-hour horizon in five-minute slots, including deadlines that cross local midnight. It is deterministic: identical normalized configuration, snapshots, forecast inputs, recovery state, and clock input produce identical plan intervals and reasons.

At each plan/replan it:

1. Builds allowed intervals from mode, mandatory windows, manual override, availability, data quality, and safety constraints.
2. Calculates remaining requirements and latest safe starts using confirmed delivery where available and conservative estimates otherwise.
3. Assigns marginal cost for each eligible source/slot: import tariff, forgone feed-in for solar, and configured battery penalty plus replacement cost for battery discharge.
4. Applies the lexicographic objective: hard electrical safety → hard equipment safety → mandatory windows → guaranteed completion → cost → switching → solar tie-break → priority/fairness.
5. Returns a non-actuating proposed plan, shortfalls/risks, confidence/quality, and machine-readable reasons.

The real-time loop is event-driven (input changes, timer boundaries, feedback, config/override changes, and replan actions). It asks the arbitrator to authorise the next action, checks relevant freshness/constraints again, commands through the adapter, awaits feedback where configured, and records a `DecisionEvent`.

Planner preview calls exactly the same pure planning path with read-only/null adapters. Preview has no command capability and must never write recovery state, issue actions, or alter qualification timers.

## Requirement and deadline semantics

One load may select no target, schedule-only, commanded/confirmed runtime, energy, temperature, SOC, deadline, or a declared composite:

- `ALL`: every selected completion condition is required.
- `ANY`: any selected condition completes the target.
- `PRIMARY_WITH_GUARDS`: a primary target completes operation, while secondary conditions constrain readiness/safety.

For runtime targets the baseline calculation is:

```text
remaining_runtime = target_confirmed_runtime - confirmed_runtime
latest_safe_start = deadline - remaining_runtime - safety_margin
```

The production calculation also considers min-off, mandatory breaks, max continuous runtime, actuator delay, variable delivery rate, learned duty factor, thermostat interruption, capacity, higher-priority work, and missed windows. An unachievable request is classified `at_risk` or `impossible`, includes expected shortfall/reasons, raises configured notification/repair evidence, and is still allocated the best safe allowed plan.

## State machine and reasons

The implementation has explicit load states:

```text
DISABLED · INITIALISING · NOT_CONTROLLED · IDLE · WAITING_FOR_WINDOW
SCHEDULED_RUN · FREE_PERIOD_RUN · SOLAR_QUALIFYING · SOLAR_RUN
LOW_COST_RUN · DEADLINE_CATCHUP · VARIABLE_POWER_RUN
MINIMUM_ON_HOLD · MINIMUM_OFF_HOLD · MANUAL_ON · MANUAL_OFF
TARGET_COMPLETE · BLOCKED_BY_SITE_LIMIT · BLOCKED_BY_HIGHER_PRIORITY
INPUT_UNAVAILABLE · ACTUATOR_UNAVAILABLE · FAULT
```

Every transition records UTC timestamp, previous/new state, stable reason code, snapshot reference, proposed next action, configuration revision, requested action, and feedback confirmation. Reasons are symbolic protocol values—not English messages—such as `automatic_control_disabled`, `fixed_schedule`, `solar_export_qualified`, `deadline_catchup`, `manual_timed_boost`, `site_import_limit`, `hard_electrical_limit`, `higher_priority_load`, `price_unavailable`, `feedback_not_detected`, and `restart_stabilisation`. The frontend translates them from locale catalogues.

## Automatic control and manual overrides

`automatic_control=false` transitions a load to `NOT_CONTROLLED` without commanding on/off. It makes no automatic allocation request, suppresses schedules/catch-up/optimisation, and does not command the observed state repeatedly. Monitoring, history, and detectable fault work continue. Re-enabling clears any active override, replans, and returns to automatic state.

Overrides are immutable records until replaced/cleared:

| Override | Automatic enabled | Automatic disabled |
| --- | --- | --- |
| Timed/indefinite On | Normally outranks price/ordinary priority; hard limits remain; re-evaluate at expiry | Operates despite ordinary cost/solar/schedule/priority; hard limits remain; timed expiry turns off then returns `NOT_CONTROLLED` |
| Timed/indefinite Off | Suppresses load; at expiry returns to automatic policy | Keeps output off for the request, then releases without enabling automatic control |
| Return Automatic | Clears override, re-evaluates | Enables automatic control and re-evaluates |

Timed expiry is an absolute UTC instant, never a “remaining duration” reset at restart. Indefinite overrides persist until cleared or automatic control is enabled.

## Solar, holds, and variable current

Binary solar logic tracks separate start/stop thresholds, respective continuous qualification durations, rolling average period, min-on/min-off holds, max starts/day, and site start staggering. This hysteresis is a state-machine condition, not a frontend timer.

Variable-current allocation returns only setpoints within configured min/max/current increment. It supports up/down qualification, min interval between adjustments, maximum step, and immediate emergency decrease when a hard limit is breached. A failed variable action uses the configured safe fallback and creates fault evidence rather than oscillating.

Qualification and hold elapsed time are measured by an injected monotonic clock when process uptime exists. Recovery persists wall-clock anchors and reconstructs conservative remaining holds after restart; it never claims an unobserved qualification completed.

## Site arbitrator

The arbitrator aggregates requests and allocates available capacity once. It applies hard import/controlled-load/phase limits, max concurrent binary loads, safety margin, start staggering, priorities, earliest deadlines, fairness debt, and solar availability. It must not allocate a single watt of observed/forecast solar surplus to more than one request.

Default ordering is hard safety, manual under hard limits, immediate guarantee risk, mandatory schedules, user priority, lower marginal cost, earlier deadline, and recently denied fairness. Where appropriate it reduces variable loads before stopping binary loads. A denial carries a stable reason such as `hard_electrical_limit`, `controlled_power_limit`, or `higher_priority_load`.

Manual requests may exceed soft targets only if configuration permits; hard equipment and electrical limits never yield. Fairness changes only eligibility between otherwise safe/valid requests and can never violate mandatory/safety completion rules.

## Time, DST, and operational days

Schedules are expressed in site local time. Operational day defaults to local midnight but is configurable. The conversion policy is explicit:

- A fall-back **start** wall time resolves to the first occurrence; an **end** resolves to the second occurrence.
- A nonexistent spring-forward wall time advances to the first valid local instant.
- Intervals crossing midnight remain one logical interval until their resolved UTC end.
- All persisted instants and override expiries use UTC.

Tests must prove the policy in Brisbane, Sydney, UTC, and a northern-hemisphere DST timezone. Day rollover, meter reset/corruption, duplicate events, reload, and restart must not make daily confirmed runtime decrease.

## Recovery, persistence, and observability

Config entries/subentries store configuration. A versioned HA Store holds only bounded recovery data: operational-day counters, observed/last-commanded state, holds, overrides, bounded journal, latest planner snapshot, daily summaries, learning, and revision metadata. Recorder/long-term statistics hold historical time series. Journal retention is configurable and graph queries are downsampled by range.

Startup sequence is configuration → migrations → recovery state → interfaces/entities → observation → stabilisation → timer/override reconstruction → plan → valid-input resumption. A currently-on load is adopted only when safe, feedback is checked, hold timing is recovered conservatively, site limits are re-evaluated, and the decision is journaled. Missing inputs never imply solar/free energy or start discretionary runs.

## Safety invariants

The following are non-negotiable and have property/integration test coverage:

1. A disabled-Automatic load receives no automatic command.
2. Preview cannot command, write recovery state, or change policy state.
3. Max runtime, max starts, min off, equipment bounds, and setpoint bounds are respected.
4. The arbitrator never knowingly authorises a hard-limit breach or duplicate solar allocation.
5. All interval durations are non-negative; daily runtime is non-decreasing within its operational day.
6. Learning never changes a hard electrical/equipment limit.
7. Startup/migration/reload/diagnostics/panel loading never blindly switch an output.
8. Fault handling avoids command loops and preserves evidence until recovery is demonstrated.
