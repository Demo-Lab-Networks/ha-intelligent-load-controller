# Intelligent Load Controller — Product Specification

**Status:** Normative V1 baseline
**Source:** Consolidated from the supplied product brief (sections 1–44), 2026-07-22. The brief remains the originating product request; this document is the concise, implementation-facing specification. The traceability matrix assigns stable identifiers to its requirements.

## Product identity

| Item | Decision |
| --- | --- |
| Product / short name | Intelligent Load Controller / Load Control |
| Domain / package | `intelligent_load_controller` / `custom_components/intelligent_load_controller` |
| Deployment | One local-only Home Assistant custom integration, distributed through HACS |
| Panel | `/intelligent-load-controller`, **Load Control**, `mdi:transmission-tower` |
| Licence | Apache-2.0 |
| Configuration | Home Assistant UI; normal use never requires YAML |
| Initial language | English, with internationalisation designed in from the first release |
| V1 compatibility floor | Home Assistant Core 2025.4.0; the same floor belongs in `hacs.json` |
| Timezone test baseline | `Australia/Brisbane`; also Sydney, UTC, and a northern-hemisphere DST zone |

V1 uses the Home Assistant configured locale, timezone, currency, unit system, and theme. It does not assume Australian tariffs, one phase, metric display, English-only strings, or a particular retailer.

## Mission and scope

The product is one **site-level flexible-load controller**, not a collection of independently competing automations. It allocates energy and operating time so each load receives required runtime, energy, temperature, SOC, schedule-window, or deadline outcomes while preferring the lowest valid marginal-cost energy and respecting user, equipment, and electrical constraints.

V1 controls and coordinates these load types:

1. Electric hot-water systems (HWS).
2. Generic binary switch loads.
3. Loads controlled by user-configured Home Assistant action pairs.
4. Binary EV chargers.
5. Variable-current EV chargers.
6. Generic battery chargers.
7. A switch-controlled home battery represented as a generic load.
8. Multiple simultaneous loads under a single site orchestrator.

The following are explicitly not V1 implementations: direct retailer APIs, cloud forecast clients, intelligent battery dispatch/discharge, vendor-specific device adapters, full phase-aware optimisation, multi-site or multi-switchboard control, demand response, carbon control, and V2G. Their interfaces and data model must remain feasible.

## Non-negotiable product properties

- The backend is authoritative; neither the panel nor a browser contains safety-critical control logic.
- The controller remains safe and functional when the panel is absent/disconnected/fails, Home Assistant restarts, Recorder history is unavailable, or forecasts are unavailable.
- Control is local. There are no runtime CDNs, retailer credentials, mandatory cloud services, or manual Lovelace resource steps.
- A bundled full-screen sidebar panel discovers configured loads dynamically. Every load has a routed detail dashboard; native config and subentry flows remain a complete fallback.
- The integration supplies entities, actions, notifications, repairs, diagnostics, migration support, Energy-compatible sensors, decision explanations, automated tests, simulations, HACS validation, Hassfest validation, and reproducible frontend builds.
- Ordinary setup, editing, preview, and operation are UI-driven. Advanced users may call documented actions or entities from their own automations.

## Configuration and operating model

One config entry represents one electrical site in V1; the model is deliberately multi-site-ready. Site settings include sensors, phases, tariffs/feed-in/free windows, optional battery monitoring, limits/margins/staggering, notifications, retention, dashboard/history preferences, forecasts, optimisation defaults, feature flags, and a schema version.

Each controlled load is a `load` config subentry owned by that site. It has a stable UUID, display metadata, adapter and feedback binding, requirement/schedule/optimisation/priority/phase/safety/Boost/learning/notification settings, a configuration revision, and a schema version. It supports add, edit, disable, duplicate, delete, reconfigure, migrate, and diagnostic export.

Panel mutations and Home Assistant flows call the same backend schema and validator. Mutations carry `if_revision`; an outdated write receives the stable `config_conflict` response and does not overwrite newer configuration.

## Site inputs and constraints

The integration accepts a signed net-grid sensor with selected convention, or independent import/export sensors. Solar may be aggregate, per phase, or absent; solar-export control must still work from net-grid data alone. The model represents aggregate plus phases A/B/C, retains load phase metadata, displays phase history, and detects obvious configured phase-limit breaches. V1 may plan predominantly against aggregate values.

Optional battery monitoring covers SOC, charge/discharge power, state, and reserve SOC. A policy may prevent discretionary loads from provoking household battery discharge.

Price inputs include fixed, static time-of-use, current-entity, and future-entity prices; fixed/entity feed-in tariffs; free periods; and negative prices. Currency/kWh, cents/kWh, and currency/MWh convert safely; incompatible units are rejected with an actionable validation error.

The site distinguishes a soft optimisation import target, hard electrical import limit, controlled-load-power ceiling, maximum binary loads, optional phase limits, safety margin, and start staggering. Hard limits supersede both automatic and manual requests; optional manual policy may exceed soft limits only.

## Load behaviour and user control

Adapters isolate Home Assistant/device calls from policy. They provide switch/action-pair/variable-number semantics, actuator state, safe feedback, and bounded manual actuator tests. Setup never runs an action as a test.

Loads may have no target; fixed schedules; commanded or confirmed runtime; delivered energy; target temperature; target SOC; deadline; or combinations. Combination semantics are explicitly all-of, any-of, or primary target plus secondary readiness/safety conditions. Deadline logic accounts for holds, breaks, delays, capacity, higher-priority loads, learned performance, thermostat interruptions, and missed windows. An impossible target is visibly at-risk/impossible, quantified, notified/repairable when configured, and still given the best safe plan—never reported as on track.

Every load exposes **Automatic control**. Disabling it must leave the physical output unchanged, suspend automatic allocation/schedules/catch-up, issue no state-preservation commands, and show **Not controlled** while monitoring and history continue. Re-enabling clears the active manual override and immediately re-evaluates policy.

Each load supports timed and indefinite On/Off and return-to-Automatic overrides with type-appropriate labels (for example, Boost/Charge now/Run now). Overrides persist through restart, reload, and browser loss; timed overrides preserve their absolute expiry. Manual operation generally outranks cost and ordinary priority but never hard equipment/electrical limits. Indefinite overrides show a persistent warning.

Per-load modes are Disabled, Manual, Schedule only, Solar surplus only, Free energy only, Cheapest tariff, Solar preferred with guarantee, Cost-optimised hybrid, and Custom priority. Custom priority makes permitted sources/catch-up explicit and warns where a target may be missed.

## Cost, planning, and orchestration

The controller minimises **marginal** cost: import tariff for grid energy, forgone feed-in tariff for solar, and configured battery penalty plus replacement-energy estimate for battery discharge. It accounts for free/negative prices, efficiency, expected load power, and duration. Savings are optional, require a configured baseline, identify measured versus estimated values, and are never presented as retailer billing.

The platform-independent planner accepts immutable snapshots and produces a rolling 24-hour, five-minute-resolution plan: intervals, proposed states/setpoints, expected runtime/energy/completion/cost, source allocation, warnings, unmet requirements, reason codes, input quality, and forecast confidence. Real-time control is event-driven. Its lexicographic objective order is:

1. Hard electrical safety.
2. Hard equipment safety.
3. Mandatory schedules.
4. Guaranteed completion.
5. Lowest marginal cost.
6. Fewer switches.
7. Solar self-consumption tie-break.
8. Priority and fairness.

V1 planning is deterministic and explainable, with no ML planner and no solver dependency. A future local solver is permissible only with an acceptable licence, low burden, deterministic fallback, and no safety dependence.

Each solar-controlled binary load has distinct start/stop thresholds, qualification, rolling average, minimum on/off, maximum daily starts, and stagger controls. Variable-current devices add increase/decrease qualification, step/rate limits, safe fallback, and emergency rapid reduction. Qualification/hold durations use monotonic time; schedules/deadlines use Home Assistant local time.

Individual controllers request operation, but the site arbitrator is the sole authority for final automatic actions. It enforces limits, avoids solar double-allocation, prioritises guarantees, applies fairness and staggering, allocates variable power, reclaims capacity, reduces variable power before binary stopping where suitable, and records denial reasons. Default order: hard safety; manual subject to hard limits; immediate guarantee risk; mandatory windows; user priority; marginal cost; earliest deadline; recent-denial fairness.

## Accounting, forecasts, learning, and recovery

Runtime/energy accounting distinguishes commanded, confirmed, estimated, and source-attributed runtime/energy/cost; starts, setpoint changes, blocked time, and shortfalls. The operational day is configurable (default local midnight) and safely handles reload, DST, counter reset/corruption, duplicate events, and deadlines crossing midnight. Home Assistant Recorder and long-term statistics remain the historical store; no parallel time-series database is created.

Forecast provider interfaces support price, solar, site-load, carbon, and market-event points with interval, value/unit/source, retrieval/validity, confidence, and quality metadata. V1 consumes compatible Home Assistant entities/events/calendars only. Forecasts cannot create a false guarantee or cause unsafe control when stale/missing; direct providers remain outside the core planner.

Every load starts with a conservative configured estimate. Where suitable feedback exists, deterministic learning (rolling median/EWMA, valid-sample gating, outlier rejection, bounds, confidence, time decay) can estimate active power, delays, delivery/SOC rate, efficiency, duty factor, response, and cycle duration. Learned values stay bounded, preserve the configured estimate, never alter hard limits, are explainable, and can be enabled, disabled, frozen, reset, or restored.

On setup/reload, the integration loads/migrates configuration and recovery state, registers interfaces, observes input/output feedback, stabilises, reconstructs timers/overrides, replans, then resumes only with valid inputs. It never blindly switches an output during startup, migration, reload, preview, diagnostics, or panel loading.

## Home Assistant and panel surface

The integration creates a site device and one device per load. Site and load entities expose the operational status, inputs, targets/progress, costs/energy, allocation, reasons, health/faults, learning, and safe actions described in the traceability matrix. Measured/derived energy is cumulative, `total_increasing`, statistically compatible, stable, reset-aware, and associated with the correct device. UI guidance prevents aggregate-plus-per-load Energy-dashboard double counting.

The stable Home Assistant action surface is:

| Action | Required semantics |
| --- | --- |
| `start_override` | Targets one load and accepts `on`/`off` plus exactly one of duration, absolute UTC expiry, or indefinite mode. |
| `clear_override` | Removes a load override without changing an unrelated Automatic-control setting. |
| `set_automatic_control` | Enables or disables one load's Automatic control; enabling clears its active override and replans. |
| `replan` | Replans one load or the whole site without bypassing the arbitrator. |
| `skip_operational_day` | Marks the selected load's current operational-day target as skipped with a journal reason. |
| `reset_daily_accounting` | Requires explicit confirmation and records a reset event. |
| `export_decision_report` | Produces a bounded, redacted decision report. |

Errors are meaningful Home Assistant exceptions.

The panel uses authenticated, versioned `intelligent_load_controller/v1/...` WebSocket commands for summaries, plans/timelines/history/events, schema/configuration CRUD/preview, load CRUD, overrides, replan, CSV, diagnostics, and learning. It validates server-side, requires admin for writes, rate-limits expensive reads, scopes subscriptions/data, uses stable errors, and does not expose secrets or unrestricted entity state.

## Safety, observability, and release quality

The controller detects stale/unavailable inputs, actuator/feedback mismatch, implausible power, breaches, impossible constraints, repeated failures, excessive switching, and accounting inconsistency. It avoids command loops; emits fault entities, events, alerts, configurable/deduplicated notifications, repair issues, recovery guidance, health data, bounded/redacted diagnostics, and downloadable reports.

It is scheduling/control software, not electrical protection. Documentation must require properly rated switching, preserved appliance protections/thermostats, compliant electrical work, and licensed electricians where required; it must not provide wiring instructions.

Release quality requires the test, simulation, security, licence, migration, HACS, Hassfest, accessibility, coverage, documentation, screenshot, and clean-install evidence defined in `TEST_PLAN.md`, `DEPENDENCY_REVIEW.md`, and `ROADMAP.md`.
