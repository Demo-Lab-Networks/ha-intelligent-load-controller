# Test Plan and Evidence Model

**Status:** Normative V1 verification plan
**Principle:** Safety properties are proven at the pure-controller and integration boundary; UI tests verify intent/rendering, never substitute for control-engine tests.

## Test layers

| Layer | Tools | Scope | Evidence |
| --- | --- | --- | --- |
| Unit/property | pytest, Hypothesis | Pure models, schedule/DST, planning, arbitration, accounting, learning, invariants | JUnit + coverage + seeded counterexample fixtures |
| HA integration | pytest Home Assistant harness | Config/subentry flows, lifecycle, entities, actions, Store/migration, diagnostics, repairs, WS/auth/panel | JUnit + log/diagnostic redaction assertions |
| Frontend unit | Vitest | typed models, state, routes, forms, localisation, error/conflict/reconnect states, chart alternatives | JUnit + frontend coverage |
| End-to-end | Playwright + axe | UI setup/config/dashboard/control flows, responsive/theme/accessibility/reconnection | video/screenshot/traces + axe result |
| Simulation | deterministic simulator | weather/load/tariff/fault/full-year behavior and capacity safety | JSON report + human Markdown/CSV report + seed/config |
| Release validation | CI/HACS/Hassfest/security/licence tools | reproducible build/package/release readiness | immutable workflow artifact and check output |

All test inputs use simulated/non-production Home Assistant entities. Tests use an injected clock; no policy test depends on the host wall clock. Deterministic simulations record scenario version and seed.

## Test identifier catalogue

### Pure controller and property suite

| ID | Scenario / assertion |
| --- | --- |
| T-CTRL-001 | Fixed, multiple, and overnight schedules resolve into non-overlapping valid UTC intervals |
| T-CTRL-002 | DST policy: Brisbane, Sydney, UTC, and northern hemisphere fall-back/spring-forward resolution |
| T-CTRL-003 | Operational-day rollover, counter reset/corruption, duplicate event, reload, and deadline-crossing-midnight accounting |
| T-CTRL-004 | Signed net-grid conventions and separate import/export normalization |
| T-CTRL-005 | Aggregate/per-phase snapshot metadata and obvious configured phase-limit breach detection |
| T-CTRL-006 | Fixed, TOU, current/future entity, feed-in, free, negative, and stale/missing price behavior with unit conversion/rejection |
| T-CTRL-007 | Marginal-cost calculation including solar opportunity cost, battery penalty, efficiency, and baseline-gated savings |
| T-CTRL-008 | Requirement models: none, schedule, commanded/confirmed runtime, energy, temperature, SOC, deadline, ALL/ANY/PRIMARY_WITH_GUARDS |
| T-CTRL-009 | Latest-safe-start and impossible/at-risk calculation with hold, delay, break, capacity, priority, duty-factor factors |
| T-CTRL-010 | Mode eligibility: Disabled, Manual, schedule, solar, free, cheapest, guaranteed solar, hybrid, custom priority |
| T-CTRL-011 | Automatic disabled does not request or issue automatic commands and preserves observed physical output |
| T-CTRL-012 | Automatic enable clears override and immediately requests fresh automatic evaluation |
| T-CTRL-013 | Timed/indefinite On/Off/return-Automatic semantics with absolute expiry and restarted timer recovery |
| T-CTRL-014 | Manual precedence over cost/ordinary priority, but never hard equipment/electrical limits |
| T-CTRL-015 | Binary solar start/stop hysteresis, qualifications, rolling average, min-on/off, max starts, staggering |
| T-CTRL-016 | Variable-current bounds, increment, qualification, rate/step limit, safe fallback, emergency reduction |
| T-CTRL-017 | Planner determinism, 24-hour/five-minute horizon, immutable input/output, expected outputs/reasons/quality |
| T-CTRL-018 | Planner lexicographic objective order and guaranteed completion before lower cost/switching/tie-breaks |
| T-CTRL-019 | Preview path uses null adapters and has no actions, recovery writes, or state mutation |
| T-CTRL-020 | Site arbitration: hard/soft/controlled/max-count/phase limits, capacity release, staggered starts, denial reasons |
| T-CTRL-021 | Solar allocation is never double-counted across requests |
| T-CTRL-022 | Priorities, earliest deadlines, fairness debt, no permanent starvation, and manual warnings |
| T-CTRL-023 | Variable throttling before binary interruption when safe and appropriate |
| T-CTRL-024 | Explicit states/transitions/journal schema and stable reason codes independent of locale |
| T-CTRL-025 | HWS commanded/confirmed/thermostat/estimated/energy/temperature accounting |
| T-CTRL-026 | Generic/binary/action/EV/battery adapter intent semantics without HA imports in policy |
| T-CTRL-027 | Battery-discharge prevention and missing-input discretionary-run prevention |
| T-CTRL-028 | Max runtime/daily runtime/starts/min-off/feedback/power-limit fault predicates and no-loop behavior |
| T-CTRL-029 | Learning valid-sample filter, median/EWMA, outliers, bounds, confidence, separate setpoints, reset/freeze/restore |
| T-CTRL-030 | Cold-start conservative estimate and proof learning never changes hard limits |
| T-CTRL-031 | Forecast point validity/quality/confidence and stale/low-confidence safe degradation |
| T-CTRL-032 | Recovery reconstruction of holds/qualifications/overrides adopts no unobserved elapsed state |
| T-CTRL-033 | Property: no negative duration; daily runtime does not decrease; all intervals valid |
| T-CTRL-034 | Property: hard limits/setpoints/max runtime/min off remain respected under generated inputs |

### Home Assistant integration suite

| ID | Scenario / assertion |
| --- | --- |
| T-HA-001 | Manifest/HACS metadata/translations validation and one-component package layout |
| T-HA-002 | Initial site config flow, optional steps, unit/sign/sensor/limit/schedule validation |
| T-HA-003 | Add/edit/disable/duplicate/delete/reconfigure/migrate load subentries with UUID/revision/schema retention |
| T-HA-004 | Native config/options/subentry flows share canonical backend validation |
| T-HA-005 | Optimistic revision conflict returns `config_conflict` without partial overwrite |
| T-HA-006 | Setup, unload, reload, remove, static path, panel add/remove lifecycle |
| T-HA-007 | Startup/reload/migration stabilises/observes first and never blindly switches output |
| T-HA-008 | Active-load adoption, feedback confirmation, timer/override/counter recovery, replan journal |
| T-HA-009 | Site/load device and entity availability, classes, units, categories, stable IDs |
| T-HA-010 | Energy `total_increasing` sensor/statistics compatibility, derived energy, meter reset, double-count guidance |
| T-HA-011 | Actions: override variants, Automatic, replan, skip day, confirmed reset, report export and meaningful exceptions |
| T-HA-012 | Notification selection, deduplication/rate limit, required/optional trigger policy |
| T-HA-013 | Diagnostics redaction/bounded retention, system health, decision/validation/learning reports |
| T-HA-014 | Fault entities, repair issue create/update/clear evidence and recovery guidance |
| T-HA-015 | Versioned WebSocket auth, admin writes, schema validation, stable errors, data scoping, rate limits, subscriptions |
| T-HA-016 | WebSocket plan/configuration preview cannot actuate or mutate controller recovery state |
| T-HA-017 | Store schema migrations are forward/idempotent and do not retain passwords/tokens/raw history |
| T-HA-018 | Recorder unavailable / stale sensor / unavailable actuator / unavailable forecast safe behavior |

### Frontend suite

| ID | Scenario / assertion |
| --- | --- |
| T-UI-001 | Strict API model decoding, stable error mapping, auth/permission state, reconnect resubscription |
| T-UI-002 | Site dashboard header/cards/sort/group/filter/quality states and direct load route refresh |
| T-UI-003 | Load-specific HWS, EV, battery, generic content and translated decision explanation |
| T-UI-004 | Graph/timeline data handling, CSV request, text/table alternative, no chart-only critical fact |
| T-UI-005 | Site/load wizard progressive disclosure, defaults, validation, revision conflict, native-flow handoff |
| T-UI-006 | Presets remain editable and schedule editor supports overnight/conflict/deadline/undo/exact time controls |
| T-UI-007 | Non-actuating preview visual contract and warning/confidence display |
| T-UI-008 | Automatic/override controls, confirmations, indefinite warning, pending feedback/action failures |
| T-UI-009 | Learning controls/state, history/diagnostic/empty/error/reconnecting states |
| T-UI-010 | Localisation, `Intl` date/time/currency/unit/number formatting, theme variables and reason-code translation |
| T-UI-011 | Keyboard/focus/labels/reduced motion/colour-plus-text/44px-control/unsaved-change behavior |

### End-to-end suite

| ID | Scenario / assertion |
| --- | --- |
| T-E2E-001 | First setup through site wizard with no YAML or manual Lovelace resource |
| T-E2E-002 | Add each V1 load type, edit/reconfigure/duplicate/delete it, and reach its routed page |
| T-E2E-003 | Configure presets, visual schedule, tariff/solar settings, validation error, and non-actuating preview |
| T-E2E-004 | Central dashboard, graph/timeline, decision explanation, events, and per-load dashboard workflows |
| T-E2E-005 | Automatic On/Off, timed Boost, indefinite override, clear/expiry UI behavior |
| T-E2E-006 | Mobile/tablet/desktop; light/dark Home Assistant themes; reconnection; empty installation |
| T-E2E-007 | Fault/repair/permission/revision-conflict states and safe error recovery |
| T-E2E-008 | Twenty-load installation discovery/sort/timeline and axe accessibility scan |

### Simulation suite

| ID | Scenario / assertion |
| --- | --- |
| SIM-001 | Clear solar, cloudy solar, and no-solar days with household demand and import/export |
| SIM-002 | Fixed/TOU/dynamic/free/negative tariff and feed-in opportunity-cost behavior |
| SIM-003 | HWS thermostat cycle, HWS guarantees, HWS free/solar/catch-up and anti-flapping |
| SIM-004 | EV arrival/departure/SOC, binary and variable solar charge, hard-limit reduction |
| SIM-005 | Generic battery and generic load target/free/solar/Boost behavior |
| SIM-006 | Competing HWS/EV/battery/pool loads with 20 simultaneous requests, fairness and allocation evidence |
| SIM-007 | Sensor/actuator/forecast failure, stale input, restart while active, recovery/fail policy |
| SIM-008 | Full-year accelerated run covering seasons, DST, counter rollover, costs, limits, and performance budget |

## Required acceptance scenarios

| Acceptance ID | Evidence tests | Required observed outcome |
| --- | --- | --- |
| AC-001 Fixed HWS schedules | T-CTRL-001, T-CTRL-015, T-UI-004, SIM-003 | Multiple/different-day/overnight windows honour holds and show plan/actuals |
| AC-002 HWS solar guarantee | T-CTRL-008–009, 015, 018, 025; SIM-003 | Qualified >2 kW solar, anti-flapping, five-hour confirmed runtime, peak catch-up, segment reasons |
| AC-003 HWS free period | T-CTRL-006–009, SIM-003 | Morning guarantee/free period/catch-up and correct cost attribution |
| AC-004 EV ready by departure | T-CTRL-006–009, 016–018; SIM-004 | SOC/departure plan prefers free/negative/economical solar and uses paid energy only when required |
| AC-005 Solar EV | T-CTRL-016, 020, 023; SIM-004 | Stable export tracking, valid min current/rate limit, cloud stability, rapid hard-limit reduction |
| AC-006 Generic battery | T-CTRL-010, 013–014, 026; SIM-005 | Switch battery supports free/solar/Boost/runtime-or-energy without vendor dependency |
| AC-007 Competing loads | T-CTRL-020–023; SIM-006; T-E2E-008 | Single solar allocation, limits, deadline priority, variable throttle, staggered starts, denial reasons |
| AC-008 Automatic disabled | T-CTRL-011–012; T-E2E-005 | Output remains unchanged, Not controlled shown, no automatic command follows |
| AC-009 Boost while disabled | T-CTRL-013–014; T-E2E-005 | Manual one-hour On works despite ordinary policy, hard limits apply, expiry returns Not controlled |
| AC-010 Indefinite manual | T-CTRL-013; T-HA-008; T-E2E-005 | Warning/override survives restart; enabling Automatic clears and re-evaluates |
| AC-011 Restart recovery | T-CTRL-032; T-HA-007–008; SIM-007 | No blind actions; counters/holds/overrides/feedback recover and plans recalculate |
| AC-012 Sensor failure | T-CTRL-027–028; T-HA-014/018; SIM-007 | No inferred solar/discretionary start; active policy/fault/repair evidence appears |
| AC-013 Adaptive estimate | T-CTRL-029–030 | Conservative 3.6→3.45 kW learning, low confidence limited, outlier rejected, reset restores configured estimate |
| AC-014 Multi-phase display | T-CTRL-005; T-HA-009; T-UI-002 | Aggregate/phase display, phase assignment, persistence/migration, aggregate control works |
| AC-015 Energy dashboard | T-HA-010 | Valid measured/derived stats, reset handling, and double-count warning/guidance |
| AC-016 Entity price | T-CTRL-006/031; T-HA-018 | Provider-agnostic entity input, stale rejection, safe missing-forecast fallback |
| AC-017 Complete UI workflow | T-E2E-001–008 | Site, all loads, presets, schedule, preview, dashboards, Boost flow all work without YAML |

## Quality and release gates

| Gate ID | Gate |
| --- | --- |
| GATE-001 | Backend line coverage ≥90% |
| GATE-002 | Frontend line coverage ≥85% |
| GATE-003 | Full branch coverage for safety-critical logic/invariants |
| GATE-004 | Zero MyPy and Ruff errors |
| GATE-005 | Zero frontend type and lint errors |
| GATE-006 | Zero accessibility failures in defined axe/keyboard checks |
| GATE-007 | HACS and Hassfest validation pass |
| GATE-008 | Reproducible locked frontend build equals committed artifact |
| GATE-009 | Deterministic simulation reports including full-year run pass review |
| GATE-010 | Migration, security, dependency/licence, diagnostics-redaction, clean HACS install, screenshot, and release workflow evidence complete |

Coverage does not replace scenario/invariant evidence. Any known hard-limit, uncontrolled-actuation, data-disclosure, or migration-loss defect blocks release regardless of percentage.
