# Frontend and UX Specification

**Status:** Normative V1 panel contract
**Technology decision:** strict TypeScript, Lit, Vite, native `Intl`, and locally bundled Apache ECharts. See [ADR-0005](architecture/adr/0005-frontend-architecture-and-accessibility.md).

## Product boundary

The sidebar panel is an authenticated, full-screen companion to the Home Assistant integration. It discovers site and load data dynamically; users do not create Lovelace cards or resources. It must be useful on desktop, tablet, and mobile, and it must degrade into clear loading/error/reconnect states if backend data is absent.

The panel displays plans, explanations, configuration, and history. It does **not** calculate authoritative safety, cost, deadlines, allocation, status, or action eligibility. It sends user intent to the versioned backend API and renders server-returned values, reason codes, validation, revisions, and permissions.

## Information architecture

```text
/intelligent-load-controller
├── Site dashboard                 (default)
├── Loads                           (filter/sort and route to a load)
├── Load detail /:loadId            (type-aware route)
├── Configuration
│   ├── Site wizard / edit
│   ├── Add load / edit / duplicate
│   ├── Visual weekly schedule
│   └── Safe preview / validation
├── History and decision journal
└── Diagnostics / help              (permission-aware)
```

Navigation always makes site context and data freshness visible. A direct load URL must work after refresh and reconnect. Missing/deleted/inaccessible loads use an explanatory empty/error route rather than a blank page.

## Everyday operation

The default view answers, at a glance: is it running, why, whether Automatic control is on, whether the target is on track, what happens next, what remains, cost today, whether a Boost is active, and whether intervention is needed.

Primary actions are Automatic control, Boost, Stop/cancel, optimisation mode, and load details. Standard settings expose target, deadline, schedule, solar/free-period/cost behaviour, priority, and Boost presets. Advanced controls are collapsed and include hysteresis, qualification, learning bounds, phase, fail policy, planner margins, battery penalties, forecast confidence, max starts, and site constraints. Contextual help states the consequence of each material choice.

The **Explain this decision** affordance opens a textual explanation generated from server reason code, plan inputs, risk/shortfall, and next action. For example, it may explain that a HWS is running because remaining confirmed runtime plus waiting for solar would miss a deadline. It must not invent an explanation from client heuristics.

## Site dashboard

### Header

Display current grid import/export, solar production, configured phase values, total controlled power, active/waiting loads, current tariff, cost and controlled energy today, next deadline, and site health. Each value has unit, freshness/quality state, and accessible text.

### Dynamic cards

Cards are generated from the backend load list. Each includes name/type, controller state, translated decision reason, power, daily progress, deadline, next action, mode, Automatic state, Boost state, and faults. Cards adapt their progress vocabulary for runtime/energy/temperature/SOC loads. Sorting/grouping supports priority, status, type, area, deadline, and name without changing control policy.

### Graph and timeline

The graph can show grid import/export, solar, total/individual controlled power, import/feed-in price, free periods, planned/actual operation, current time, deadlines, limit events, and configured phase data. It offers tooltips, zoom/pan, series visibility, light/dark themes, responsive layout, CSV export, data-quality indicators, local time, and a textual table/summary equivalent.

The daily Gantt timeline has one load row with planned, actual, fixed, solar, free-period, catch-up, blocked, and manual segments plus a current-time marker. Activating a row navigates to the load route.

Site alerts show impossible targets, sensor and actuator failure, site conflicts, priority blocks, indefinite overrides, configuration errors, and migration warnings. Alerts route users to an explanation or repair/recovery action when available.

## Per-load dashboard

Every supported load receives a route and common sections: status, Automatic control, Boost controls, progress, decision explanation, planned/actual timeline, power/energy/cost graphs, schedule, optimisation, learning, events, diagnostics, and configuration shortcut.

| Load type | Prioritised content |
| --- | --- |
| HWS | heating and confirmed element power; commanded/confirmed runtime; guarantee/deadline/latest safe start; temperature/thermostat satisfaction; source contribution; readiness; continuous-run protection |
| EV | connected/charging state; SOC/target/departure; power/requested current; energy remaining/expected completion; planned charging; solar/grid cost; throttle reason |
| Battery charger | state/power; energy target; permitted windows; free period and solar; expected completion/cost/safety limits |
| Generic | configured target, schedule/deadline, power, next action, and reason |

Actions always include a confirmation where material, accessible expiry controls, hard-limit warning copy returned by the backend, and clear completion/error feedback. Indefinite overrides receive persistent visual and textual warning.

## Configuration experience

Configuration uses progressive disclosure and a shared server schema. It uses a draft only in the browser; save/validation/preview rely on backend responses. A stale revision shows a conflict state with refresh/compare/reapply options; it never overwrites silently.

### Site wizard

Steps are welcome/safety; grid; phases; solar; tariffs; feed-in; free periods; battery monitoring; limits; notifications; dashboard/history; review. Optional portions may be skipped. Each selector shows current entity value/freshness where practical. Validation covers existence, availability, units, sign convention, price conversion, conflicting sensors, implausible limits, invalid schedules, and staleness.

### Load wizard

Steps are identity; actuator; feedback; electrical characteristics; requirement; optimisation; schedule/deadline; solar/tariff behaviour; safety; Automatic default; Boost presets; learning; notifications; review. Type-aware defaults are visible, editable, and explicitly described—presets never hide opaque policy.

Supported editable presets: HWS fixed schedule, HWS morning guarantee + solar, HWS morning guarantee + free period, HWS cost optimised, generic timed, generic solar, EV solar, EV cheapest tariff, EV departure-ready, battery free-period, battery solar, and custom advanced.

### Schedule editor

The weekly editor supports multiple daily windows, copied days, drag/resize, exact times, overnight windows, window-type colours, conflicts, deadline markers, free-period/tariff overlays, mobile interaction, keyboard operation, and undo before save. It reports DST semantics in the schedule’s site timezone. Exact controls remain available whenever drag interaction is unavailable.

### Preview

Before a material save, the panel may request a read-only preview of an example daily plan: planned intervals, target completion, estimated cost, solar use, grid catch-up, conflicts, warnings, and forecast confidence. It is labelled as estimated/conditional and visibly non-actuating. Preview failure does not enable any hidden fallback action.

Native Home Assistant config/options/subentry flows provide all essential configuration, migration, deletion, and error recovery without relying on the panel.

## WebSocket contract and client state

Commands are namespaced `intelligent_load_controller/v1/...`. The V1 names are:

| Read / subscription | Configuration / action |
| --- | --- |
| `site_list`, `site_summary`, `load_list`, `load_detail`, `current_plan`, `daily_timeline`, `historical_summary`, `event_journal`, `csv_export`, `diagnostics`, `learning_status`, `subscribe_updates` | `configuration_schema`, `configuration_read`, `configuration_validate`, `configuration_preview`, `configuration_update`, `load_add`, `load_update`, `load_duplicate`, `load_delete`, `override_start`, `override_clear`, `automatic_control_set`, `actuator_test_start`, `actuator_test_stop`, `replan`, `learning_reset`, `learning_freeze` |

Each command has a versioned request/response schema. Read commands can be subscribed to only where the backend supports a scoped live update; write commands return the authoritative updated revision and decision state.

The client sends no precomputed safety/cost result. Persisted configuration writes include `if_revision`; backend admin permission is required for writes. It handles stable errors including `unauthenticated`, `forbidden`, `invalid_config`, `invalid_request`, `config_conflict`, `not_found`, and `rate_limited`, displaying localised recovery guidance. Long/timeline/history data use range filters/pagination and server-approved subscriptions; reconnect resubscribes only after auth and refreshes the current revision.

The panel must visibly distinguish:

- loading, empty installation, unavailable data, stale data, permission denied, and reconnecting;
- server-confirmed action, pending feedback, action failure, and unknown outcome;
- measured, derived, estimated, learned, and unknown values;
- currently controlled, not controlled, manually overridden, and faulted loads.

## Accessibility, localisation, and visual system

- Strict TypeScript prevents unmodelled wire data and unsafe `any` control paths.
- Use HA theme variables; never hardcode background/text colours. Semantic status colours are supplemented by icons and text and remain colour-blind-safe.
- Interactive controls have practical 44×44 px targets, keyboard access, visible focus, descriptive labels, correct roles, and logical focus order.
- Support reduced motion, screen readers, touch, mouse, and keyboard; dialogs trap/restore focus and can be dismissed safely.
- Charts never carry critical information alone. A semantically structured summary/table is available for graph and timeline content.
- All strings, time/date/currency/unit/number formatting use translation catalogues and `Intl` with Home Assistant locale/timezone; reason codes are translated rather than parsed.
- Form validation is announced and associated with fields. Unsaved changes are guarded on route change/close. Loading skeletons preserve layout without impersonating data.

## Frontend acceptance evidence

Vitest covers routing, models/state, localisation, forms/validation, conflict handling, API errors/permissions, chart alternatives, override and Automatic states, learning controls, and unsaved changes. Playwright plus axe covers first setup, all load routes, schedules, preview, central dashboard, mobile/desktop, themes, reconnect, 20-load state, faults, empty state, keyboard, and screen-reader-visible labels. See `TEST_PLAN.md` for identifiers and quality gates.
