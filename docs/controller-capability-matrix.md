# Controller Capability Matrix

**Baseline:** `5eb6f50f57745c25771ae03ab1045af67d3ea32f`
**Version:** `0.2.0`
**Classification values:** `COMPLETE`, `PARTIAL`, `PRESENT BUT NOT USABLE`, `MISSING`, `DEFECTIVE`, `NEEDS PRODUCT DECISION`

## Capability Summary

| Capability | Status | Evidence | Notes / next action |
| --- | --- | --- | --- |
| Safety takes priority over optimisation | COMPLETE | `controller/arbitrator.py`, `coordinator.py`, tests and live validation baseline | Preserve hard-limit and stale-input fail-closed semantics. |
| Startup/reload observe before control | COMPLETE | `SiteCoordinator.async_start`, `async_stop`, live restart validation | Keep as non-negotiable safety invariant. |
| Manual override supports timed and indefinite modes | PARTIAL | `websocket_api.py`, `services.yaml`, `coordinator.py`, panel load controls | Backend supports it; UI needs confirmation, expiry editing, persistent warnings, and clearer recovery. |
| Manual override never bypasses hard limits | COMPLETE | `SiteArbitrator`, manual command source handling | Maintain backend authority; do not move this logic to frontend. |
| Resuming after override preserves expiry/recovery semantics | PARTIAL | Runtime Store `overrides`; startup purges expired overrides | Needs clearer UI evidence and tests for extend/cancel/restart display. |
| Per-load automation enable/disable | COMPLETE | `AutomaticControlSwitch`, `automatic_control_set` WebSocket command, panel control | Product copy should explain that disabling does not directly toggle equipment. |
| EV integrations remain generic | PARTIAL | `BinaryEvAdapter`, `VariableEvAdapter` | Generic entities are supported; guided EV setup and departure/SOC UX are missing. |
| Battery integrations remain generic | PARTIAL | `BatteryLoadAdapter`, site battery monitor config | Battery charger-like control exists; discharge control is intentionally absent. |
| Battery charging | PARTIAL | `BatteryLoadAdapter` wraps switch/action control | Needs guided UI and clearer product positioning. |
| Battery discharging | MISSING | `BatteryLoadAdapter` explicitly does not command discharge | Requires product/safety decision before implementation. |
| Multiple optimisation modes | PARTIAL | `const.py`, `schema.py`, `_should_run_now`, planner | Modes exist, but user-facing mode help, comparison, and type-aware defaults are incomplete. |
| Single-site product experience | PARTIAL | One config entry per site; `site_list` supports multiple | Internals support multiple entries; UX should prioritise one household site cleanly. |
| Entity-based site inputs | PARTIAL | Schema supports grid, solar, price, feed-in, battery, forecasts | Raw entity IDs are validated syntactically; guided selectors and live current-value validation are missing. |
| Entity-based actuator/feedback inputs | PARTIAL | Adapters and schema support switch/action/variable and feedback entities | Not exposed through type-aware UI. |
| Energy Dashboard relationships | PARTIAL | Sensors use energy device classes/state classes | Needs user guidance on measured vs derived energy and double-counting. |
| Conservative load estimate learning | PARTIAL | `controller/learning.py`, `_update_learning_from_interval`, learning API | Backend exists; UI visibility/control is thin. |
| Minimum-runtime requirements | PARTIAL | `_load_request`, planner slot allocation, safety min-on | Supported by schema/backend; not easy to configure per load. |
| Site import/export constraints | COMPLETE | Site snapshot, `SiteConfigV1`, arbitrator hard/controlled limits | UI needs clearer constraint visualisation. |
| Phase limits | PARTIAL | `phase_power_entity_ids`, `phase_limits_w`, arbitrator phase headroom | UI and live product evidence need expansion. |
| Forecast inputs influence planning | PARTIAL | `PlanningInput.forecasts`, future price parsing, tariff timeline | Forecast ingestion exists; UI does not show forecast quality or forecast-vs-actual. |
| Current physical constraints override forecasts | COMPLETE | Arbitrator uses live snapshot for authority | Preserve in every planning/preview UI. |
| Fixed schedules | PARTIAL | `schedule.py`, `schedule_windows`, `schedule_only` | No visual schedule editor yet. |
| Solar-surplus operation | PARTIAL | `controller/solar.py`, `_solar_should_run` | Needs type-aware setup and clearer qualification status. |
| Standard and peak tariffs | PARTIAL | Fixed and TOU tariff parsing | No tariff setup UI beyond raw config. |
| Free-use tariff windows | PARTIAL | `free_energy_periods`, `free_energy_only` | Needs guided setup and timeline overlay. |
| Wholesale/current/future price signals | PARTIAL | Current/future price entity parsing | Needs entity selector, stale/gap visibility, and provider examples. |
| Decision reason codes | COMPLETE | `ReasonCode`, `frontend/src/i18n/messages.ts` | Stable reason code contract exists. |
| Plain-language decision explanation | PRESENT BUT NOT USABLE | Reason translations exist; no explanation model | Add backend explanation facts and UI panels. |
| Planner presentation | PARTIAL | `current_plan`, `daily_timeline`, plan tables | Needs load names, current interval, grouped timelines, constraints, price/solar overlays. |
| Schedule presentation | PRESENT BUT NOT USABLE | Plan intervals and raw config are visible | Add weekly schedule editor and daily schedule view. |
| Forecast presentation | PRESENT BUT NOT USABLE | Backend parses price forecast; UI lacks forecast views | Add forecast timeline/quality states. |
| Manual override flow | PARTIAL | Panel buttons for timed/indefinite on/off and clear | Needs confirmation, extend, expiry display, persistent warning. |
| Empty states | PARTIAL | Loading/no-site/no-load/no-plan/no-history exist | Improve next-action guidance and HA settings deep links where possible. |
| Loading states | PARTIAL | Skeleton and section loading exist | Preserve but add section-specific loading to extracted components. |
| Unavailable states | PARTIAL | Reconnecting/error/fault entities/repairs exist | Add actionable stale sensor/actuator/forecast UI states. |
| Mobile layout | PARTIAL | Responsive CSS and overflow tables exist | Core plan/history views need mobile card alternatives. |
| Accessibility | PARTIAL | Focus styles, ARIA, axe smoke tests | Broaden keyboard/dialog/timeline/wizard coverage. |
| Diagnostics | PARTIAL | Redacted diagnostics and decision report exist | Add panel diagnostics route and clearer support export flow. |
| Services/actions | PARTIAL | Services exist for override, automatic, replan, skip day, reset, report | Selectors use text for entry/load IDs; product docs and UI discovery need improvement. |
| State persistence | COMPLETE | Bounded runtime store and startup recovery | Preserve bounded retention and redaction. |
| Reload/restart behavior | COMPLETE | Observation-first lifecycle and live validation evidence | Keep covered in every live delivery cycle. |

## Defects

No verified P0/P1 safety defect was identified in this audit. The main defects are product-completeness defects:

- Essential setup is not exposed in guided native/panel flows.
- Planner and history display raw IDs/JSON in normal user views.
- Warnings and validation errors are not consistently actionable.

## Missing Functionality

- Guided tariff, free-window, solar, battery, actuator, and feedback setup.
- Type-aware load wizards and per-load dashboards.
- Visual schedule editor.
- Daily timeline with tariff/solar/constraint overlays.
- Plain-language decision explanations.
- Forecast quality and forecast-vs-actual views.
- Generic battery discharge control, pending explicit product and safety decision.

## UX Problems

- Current state, planned state, and target progress are not visually separated enough.
- The panel exposes raw enum values and UUID-like load IDs in user-facing contexts.
- Raw stored JSON is the only way to inspect many advanced settings.
- Mobile table views are inspectable but not comfortable.

## Visual Polish

- The panel uses HA theme variables, card surfaces, focus styles, and responsive grids.
- It needs a more native-feeling hierarchy, status chips, icons, warning banners, and typography scale.
- Charts must remain supplemental; text/table equivalents are required.

## Architectural Debt

- The main panel component is too large for the roadmap scope.
- Schema lacks UI metadata for selectors, units, help text, and conditional field groups.
- API responses need display-ready grouped data while preserving stable low-level fields.

## Documentation Gaps

- Setup docs do not yet walk through a real household configuration.
- Energy Dashboard guidance needs measured/derived/double-counting explanation.
- Tariff and forecast examples need provider-agnostic input shapes.
- Manual override and automation-disable behavior need user-facing safety notes.
