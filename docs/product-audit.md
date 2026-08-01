# Product Audit

**Audit branch:** `audit/product-experience-and-roadmap`
**Baseline inspected:** `5eb6f50f57745c25771ae03ab1045af67d3ea32f`
**Version:** `0.2.0`
**Audit date:** 2026-08-01
**Scope:** Product experience, configuration, decision transparency, visual polish, controller capability, and delivery sequencing. This document does not authorise live electrical use.

## Baseline Evidence

The audit starts from the validated controller baseline on `origin/main`.

| Check | Result |
| --- | --- |
| Repository | `https://github.com/Demo-Lab-Networks/ha-intelligent-load-controller` |
| `origin/main` | `5eb6f50f57745c25771ae03ab1045af67d3ea32f` |
| Integration version | `0.2.0` |
| Home Assistant live validation context | Controlled Home Assistant `2026.7.4` validation environment |
| Product status in repository | Development alpha; simulated environments only |

## Product Surfaces Inspected

| Surface | Evidence |
| --- | --- |
| Native setup and options | `custom_components/intelligent_load_controller/config_flow.py` |
| Canonical validation | `custom_components/intelligent_load_controller/schema.py` |
| Runtime orchestration and persistence | `custom_components/intelligent_load_controller/coordinator.py`, `storage.py`, `migrations.py` |
| Planner and arbitrator | `controller/planner.py`, `controller/arbitrator.py`, `controller/models.py` |
| Adapters | `adapters/factory.py`, `binary_switch.py`, `action_pair.py`, `variable_number.py`, `ev_charger.py`, `battery_load.py` |
| WebSocket API | `websocket_api.py`, `frontend/src/api/load-control-api.ts` |
| Panel UI | `frontend/src/components/intelligent-load-controller-panel.ts`, `ilc-site-snapshot-chart.ts` |
| Entities and services | `sensor.py`, `binary_sensor.py`, `switch.py`, `button.py`, `services.yaml` |
| Diagnostics and repairs | `diagnostics.py`, `repairs.py`, `system_health.py` |
| Product docs | `docs/PRODUCT_SPECIFICATION.md`, `docs/FRONTEND_UX_SPECIFICATION.md`, `docs/ROADMAP.md`, `docs/TEST_PLAN.md` |

## Executive Summary

The controller has a strong safety-oriented backend foundation. It validates configuration through a shared schema, keeps policy code free of Home Assistant imports, observes state before acting on startup/reload, persists bounded recovery data, rate-limits privileged WebSocket commands, and records stable reason codes for decisions. This is the right base to preserve.

The product experience is still alpha. The Home Assistant native setup flow is minimal, and the custom sidebar panel exposes only a thin generic configuration form. Many mature capabilities described in `FRONTEND_UX_SPECIFICATION.md` exist in the schema or backend API, but are not yet usable through guided, type-aware UI. Decision transparency is present as reason codes, planner tables, and event logs, but it is not yet a household-friendly explanation of "why this load is on/off" or "what changed".

The main product risk is not the tested controller core; it is that a normal Home Assistant administrator cannot reliably configure the full feature set without understanding stored JSON keys, load IDs, adapter internals, and tariff/forecast schema details.

## User Roles

### Home Assistant Administrator

The administrator wants to add the integration, choose site sensors, set limits and tariffs, add a device, validate it, and correct mistakes before the controller can command anything.

Current experience:

- Initial native setup asks only for `site_name`.
- Native options expose `site_name`, `grid_sign_convention`, and `hard_import_limit_w`.
- Native load subentries expose only `display_name`, `load_type`, `expected_power_w`, `optimisation_mode`, and `automatic_control`.
- The panel can update more site/load data through WebSocket commands, but its visible form exposes only a subset of schema fields and leaves the complete stored object in an advanced JSON disclosure.
- Entity selection is text-based, not Home Assistant entity-selector based, outside the few native flow fields.

Assessment: **P1 normal-use blocker.** A technically capable maintainer can configure the product, but the intended household/admin workflow is not yet self-guiding.

### Household User

The household user wants to know what is running, what will run next, what it costs, whether hot water/EV/pool targets will be met, and whether a manual override is active.

Current experience:

- Dashboard shows grid import/export, solar, controlled power, active/waiting loads, price, cost, energy, next deadline, and health.
- Load cards show state, reason code translation, automatic control, mode, power, progress, deadline, next action, and manual override.
- Load detail supports automatic enable/disable and timed/indefinite overrides.
- Plan view shows intervals and proposals in tables.
- History view shows daily summaries and decision events.

Assessment: **P2 major clarity issue.** Key data is present, but the UI needs better hierarchy, load names in plan rows, clear "now/next/later" language, actionable warnings, and a narrative explanation surface.

## Findings by Priority

### P0 Safety or Data Integrity

No P0 product defect was found in the inspected baseline. The safety architecture is conservative:

- Startup and reload observe before control.
- Preview paths use validation/planning and do not actuate.
- Manual overrides still go through hard-limit arbitration.
- Duplicate actuator ownership is rejected and legacy conflicts fail closed.
- Stale/missing required grid input prevents positive grants.

### P1 Blocks Normal Use

| ID | Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| P1-001 | First setup does not configure the site enough for automatic control. | `config_flow.py` asks only for `site_name`; `_core_site_config()` requires positive `hard_import_limit_w`. | A new user can create an integration entry that cannot plan or operate and gets little setup guidance. | Add a guided native/panel setup path for grid sensors, sign convention, hard limit, and safe defaults. |
| P1-002 | Entity selection is mostly raw text or hidden in stored JSON. | `schema.py` supports many entity IDs; visible panel form does not expose selectors for grid, solar, tariff, battery, actuator, or feedback. | Misconfiguration is likely and hard to correct. | Add HA-native entity selectors and typed panel fields with current-value/freshness display. |
| P1-003 | Load add/edit is not type-aware enough. | Panel editor exposes name/type/mode/power/priority/phase/automatic only. | Hot water, pool runtime, EV SOC/departure, battery, schedules, feedback, and safety constraints cannot be configured clearly. | Build load-specific wizards and review screens. |
| P1-004 | Native flow parity is incomplete. | `FRONTEND_UX_SPECIFICATION.md` requires native flows provide essential configuration; current native flow is minimal. | Users without panel access or with frontend failure cannot complete essential setup. | Expand native options/subentry steps for minimum safe operation and recovery. |

### P2 Major Usability or Clarity

| ID | Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| P2-001 | Decision transparency is code/table-first. | `renderPlanIntervals()` displays `load_id`; reason copy is brief; load detail hides raw detail JSON in `<details>`. | Users cannot easily understand why a load was delayed or what condition would change the decision. | Add "Explain decision" panels generated from backend facts. |
| P2-002 | Planner, forecast, tariff, and actual state are not visually integrated. | Snapshot chart is four current bars; plan/timeline are tables only. | Users cannot see cause and effect across solar, price, load, and constraints. | Add daily timeline rows, price/solar overlays, and current-time marker with text alternative. |
| P2-003 | Warnings are not consistently actionable. | Plan warnings are joined into one text line; repair issues exist but panel routing to fixes is limited. | Users may know something is wrong but not how to fix it. | Add warning banners with affected entity/load, severity, and next action. |
| P2-004 | Current state and planned state can blur. | Dashboard cards combine current state, next action, progress, and manual override without clear visual grouping. | A user may confuse "scheduled later" with "currently running". | Separate "Now", "Next", and "Target" sections. |
| P2-005 | History summaries are raw JSON. | `renderHistoricalSummaries()` prints `JSON.stringify(summary)`. | Operational history is not meaningful to a household user. | Render runtime, energy, cost, target completion, and data provenance as named columns. |

### P3 Polish and Consistency

| ID | Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| P3-001 | Visual language is functional but sparse. | Cards, tabs, forms, tables, and chart use HA theme variables but few icons/status affordances. | The panel feels more like an engineering console than a finished HA product. | Add HA-style section headers, status chips, icons, and denser but clearer card layouts. |
| P3-002 | Terminology is inconsistent. | README says "Intelligent Load Controller"; panel title says "Load Control"; load types appear as raw enum values. | Users may not recognise the product or load categories. | Standardise product name and display labels. |
| P3-003 | Mobile layout exists but table-heavy views degrade into horizontal scrolling. | `.table-wrap` uses overflow; plan/history tables have fixed minimum width. | Mobile users can inspect but not comfortably operate. | Add card/list alternatives for narrow layouts. |
| P3-004 | Dialog behaviour is only partially mature. | Delete dialog restores focus, but override actions are immediate and indefinite overrides lack a persistent warning banner. | Material actions need clearer confirmation/feedback. | Add confirmation and active override banners. |

### P4 Future Enhancements

| ID | Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- | --- |
| P4-001 | Battery discharge control is intentionally not implemented. | `BatteryLoadAdapter` says V1 does not command discharge. | Product objective includes charge and discharge; V1 supports charger-like battery loads only. | Decide V2 battery dispatch model, safety boundary, and vendor-agnostic abstractions. |
| P4-002 | Multi-site exists technically but one-site product should be cleaner. | WebSocket `site_list` supports multiple; docs say current version should support a single site cleanly. | Multi-site selector may expose complexity early. | Keep multi-site internals but optimise IA for one household site. |
| P4-003 | Forecast confidence and forecast-vs-actual are not productised. | Forecast entity schema exists; UI has no confidence or actual comparison. | Users cannot judge plan reliability. | Add quality states and forecast-vs-actual summaries after core dashboards mature. |

## Workflow Audit

### Initial Setup

| Workflow | Current state | Gap | Priority |
| --- | --- | --- | --- |
| Create first site | Works with name only. | Does not collect required grid sensor/limit inputs. | P1 |
| Select grid import/export sensors | Schema supports net or split entities. | No guided selector or live validation in visible UI. | P1 |
| Configure grid limits | Native hard limit field exists; panel adds soft/controlled limits. | No guidance on consequences or safe values. | P1 |
| Configure tariffs | Schema supports fixed, TOU, entity, future entity, hybrid, feed-in, free periods. | Panel does not expose tariff forms. | P1 |
| Configure solar | Schema supports solar power entity and per-load solar policy. | Panel exposes only live metric if backend supplies it. | P2 |
| Configure battery | Schema supports monitoring and discharge-prevention settings. | No guided UI; no discharge control support. | P2/P4 |
| Add first controllable load | Works at simple level. | Actuator/feedback/safety/requirement fields are not guided. | P1 |
| Validate configuration | WebSocket validate/preview exists. | Errors are not associated with individual fields; issue paths are technical. | P2 |
| Recover from invalid entities | Fail-closed and repairs exist. | User recovery path is not prominent. | P2 |

### Daily Operation

| Workflow | Current state | Gap | Priority |
| --- | --- | --- | --- |
| Understand current household state | Dashboard metrics and snapshot chart exist. | Needs clearer freshness, unit, quality, and current-vs-planned separation. | P2 |
| See running loads | Load cards show controller state and power. | Sorting/grouping/filtering absent. | P3 |
| See what is scheduled next | Next action and plan intervals exist. | Load IDs and table views make it hard to scan. | P2 |
| See solar/tariff conditions | Current price and solar metric may display. | Forecast/tariff/free window overlays absent. | P2 |
| Understand decisions | Reason codes are translated. | No causal explanation or "what would change this" text. | P2 |
| Enable/disable automation | Load detail and entity switch work. | State transition consequence could be clearer. | P2 |
| Apply/cancel/extend override | Timed/indefinite start and clear exist. | No explicit extend flow; indefinite warning is not persistent enough. | P2 |
| Identify missed targets | Planner loads expose unmet slots. | UI does not surface missed/at-risk targets prominently. | P2 |
| Identify unavailable devices/sensors | Fault entities and repairs exist. | Panel needs actionable fault cards. | P2 |

### Per-Load Management

| Load type | Current support | Gap | Priority |
| --- | --- | --- | --- |
| Hot water | `hot_water` type, temperature target, fallback runtime, schedules, switch/action adapters. | No hot-water wizard or status vocabulary for temperature/confirmed runtime. | P1 |
| Pool pump | Generic binary plus runtime requirement can model pool operation. | No pool-specific required-runtime setup or daily progress language. | P1 |
| EV charger | Binary and variable EV adapters observe connected/charging/SOC. | No departure/target SOC guided UI; disconnected behavior needs clear UI warning. | P1/P2 |
| Flexible load | Generic binary is supported. | Needs simple schedule/window/priority setup. | P1 |
| Battery | Generic battery charger adapter exists; discharge prevention exists. | Discharge command/control is missing by design. | P4 |

### Planning Visibility

| Area | Current state | Gap | Priority |
| --- | --- | --- | --- |
| Current interval | Plan intervals are available. | Current interval is not highlighted. | P2 |
| Future intervals | Table exists. | Needs timeline grouped by load name. | P2 |
| Price forecast | Backend can parse future price entity. | UI does not show forecast curve/gaps. | P2 |
| Solar forecast | Forecast model exists in planner inputs. | UI does not expose solar forecast or confidence. | P3 |
| Site constraints | Arbitrator returns denial reasons; plan has warnings. | Constraints are not visualised against demand/headroom. | P2 |
| Battery plan | Battery charge-like loads can be planned. | No battery row/charge-discharge distinction. | P3/P4 |
| Forecast vs actual | Runtime accounting exists. | No comparison view. | P4 |

## Architecture Findings

### Strengths

- Pure controller models, planner, schedule, tariff, solar, learning, and arbitrator are independent of Home Assistant.
- The HA boundary centralises validation, persistence, observation, event subscription, repair issues, diagnostics, and actuation.
- WebSocket commands are versioned under `intelligent_load_controller/v1`.
- Writes require admin permission and optimistic revisions.
- The frontend has one typed API gateway and normalises server responses.
- The panel handles loading, reconnecting, errors, empty installation, multiple sites, and conflict recovery.

### Architectural Debt

| Area | Finding | Recommendation |
| --- | --- | --- |
| API contracts | The planner response is useful but does not include enough display-ready names, grouped timelines, constraint explanations, forecast quality, or explanation paragraphs. | Extend responses incrementally with additive fields; keep reason codes stable. |
| Frontend state management | One large Lit component owns routing, data fetching, forms, actions, dialogs, and rendering. | Extract dashboard, plan, configure, load detail, and shared form components as phases add complexity. |
| Configuration schema | The schema is capable but too generic for UI generation. | Add field metadata for labels, help text, selectors, units, required-by-mode rules, and display groups. |
| Error boundaries | Panel catches action errors, but sections share one global action message. | Add section-scoped errors and recovery actions. |
| Testability | Tests cover important smoke paths but not the full stated UX spec. | Add phase-specific Vitest/Playwright coverage as each roadmap phase lands. |

## Safety Findings

The audited baseline preserves safety-first controller principles. The next phases should not weaken:

- Observation-first setup/start/reload.
- Preview must remain non-actuating.
- Manual override must never bypass hard electrical/equipment limits.
- Automatic disable must not directly toggle physical outputs.
- Missing/stale grid safety input must fail closed.
- Duplicate actuator ownership must remain rejected.
- Runtime and diagnostics data must remain bounded and redacted.

## Recommendation

Start with **Phase 1: Information architecture and navigation** from `docs/product-roadmap.md`. It is the smallest safe first phase because it improves how users understand the existing validated backend without changing planner authority or live-control semantics.
