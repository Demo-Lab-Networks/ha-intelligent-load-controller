# UI Information Architecture

**Baseline:** `5eb6f50f57745c25771ae03ab1045af67d3ea32f`
**Purpose:** Define the target Home Assistant-native structure for the next product phase.

## Current IA

The current sidebar panel has these workspace views:

```text
Dashboard
Plan
History
Configure
Load controls
```

It supports loading, reconnecting, error, no-site, multi-site, empty, and ready states. This is a good base, but the views mix household operations, administration, raw configuration, and diagnostics.

## Target IA

```text
/intelligent-load-controller
├── Overview
│   ├── Site status
│   ├── Now running
│   ├── Next actions
│   ├── Warnings
│   └── Load summary
├── Loads
│   ├── All loads
│   ├── Hot water
│   ├── Pool / generic runtime loads
│   ├── EV chargers
│   ├── Flexible loads
│   └── Battery chargers
├── Load detail
│   ├── Status and decision
│   ├── Target progress
│   ├── Schedule and plan
│   ├── Controls and overrides
│   ├── Feedback and actuator health
│   ├── History
│   └── Configuration shortcut
├── Plan
│   ├── Current interval
│   ├── Daily load timeline
│   ├── Price and free windows
│   ├── Solar and forecast quality
│   ├── Site import/export constraints
│   └── Planner warnings
├── History
│   ├── Daily outcomes
│   ├── Decision journal
│   ├── CSV export
│   └── Data quality
├── Configure
│   ├── Site setup
│   ├── Add load
│   ├── Edit load
│   ├── Schedule editor
│   ├── Validate
│   ├── Preview
│   └── Review and save
└── Diagnostics
    ├── Repair issues
    ├── Sensor freshness
    ├── Actuator availability
    ├── Learning status
    └── Redacted decision report
```

The current implementation can reach this incrementally. The first phase should rename/reorganise only the visible structure and leave safety semantics unchanged.

## Phase 1 Implemented IA

Phase 1 implements the public sidebar panel as a Home Assistant-native application shell with these primary pages:

```text
/intelligent-load-controller
├── Overview
├── Loads
├── Load detail
├── Plan
├── Site
└── Settings
```

The route vocabulary is centralised in the frontend panel module. Supported route paths are:

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Overview | Default landing page for site status, current running loads, next actions, warnings, live snapshot, and links to the main areas. |
| `/loads` | Loads | Full configured-load inventory with type, state, automation, power, progress, next action, and add-load access. |
| `/load/:load_id` | Load detail | Per-load shell with back navigation, status, planning summary, controls/overrides, and configuration summary. |
| `/plan` | Plan | Existing current plan, daily timeline, warnings, replan action, cards, and table details. |
| `/site` | Site | Existing site state, live measurements, health, and read-only configured constraints. |
| `/settings` | Settings | Existing configuration, validate, preview, save, add/edit/duplicate/delete load actions. |
| `/history` | History | Secondary compatibility route for existing history and event journal data. |

Legacy `/dashboard` and `/configure` route fragments recover to Overview and Settings respectively.

## Shared Frontend Structure

Phase 1 keeps the existing Lit panel and typed WebSocket API gateway, but reorganises rendering into page-level methods:

- `renderOverview`
- `renderLoads`
- `renderLoadDetail`
- `renderPlan`
- `renderSite`
- `renderSettings`
- `renderHistory`

Shared helpers remain inside the panel for cards, metrics, load rows, status banners, plan intervals, configuration feedback, form fields, and dialog focus handling. The `LoadControlApi` remains the only frontend WebSocket gateway, and browser state remains a cache/draft rather than a source of control authority.

## Empty, Loading, and Error Conventions

Phase 1 uses these conventions:

- Initial load shows skeleton cards with `aria-busy`.
- Home Assistant reconnecting shows an assertive status banner and does not issue WebSocket commands.
- API failure shows a retryable error state and keeps technical detail in the user-visible message from Home Assistant.
- No site points to Home Assistant Settings.
- No loads explains that Settings can add a load.
- Overview no-running and no-next-action states explain what is absent without treating it as an error.
- Plan empty states say that no current plan or scheduled intervals are available yet.
- Missing load routes show a safe not-found state with navigation back to Loads.
- Section reads use a loading banner instead of replacing the whole shell.

## Responsive Navigation

The primary navigation is a horizontally scrollable HA-style tab row with five primary pages: Overview, Loads, Plan, Site, and Settings. Buttons keep practical touch-target height, headers wrap on narrow screens, action groups wrap, load metadata becomes one column on small viewports, and plan interval cards are shown before wide tables so mobile users are not forced to rely on horizontal scrolling for the core plan summary.

## Phase 1 Boundaries

Phase 1 intentionally does not implement:

- new planning, optimisation, arbitration, actuation, tariff, solar, battery, or safety behaviour;
- type-aware setup wizards;
- plain-language decision explanation facts beyond existing reason-code translations;
- new schedule editors or timeline overlays;
- new backend configuration semantics;
- harness-specific URLs, entity IDs, or validation logic.

## Home Assistant-Native Patterns

Use Home Assistant conventions as the primary reference:

| Pattern | Product use |
| --- | --- |
| Page header | Site name, integration name, health, last update, refresh/replan actions |
| HA cards | Repeated load summaries, warnings, configuration sections, history rows |
| Entity selectors | Grid, solar, tariff, battery, actuator, feedback, and EV state inputs |
| Form sections | Site safety, sensors, tariffs, battery, each load type, schedule, review |
| Chips/status indicators | Automatic on/off, running/idle, manual override, stale data, fault, plan selected |
| Dialogs | Delete load, material override, actuator test, unsaved changes |
| Timelines | Daily load plan, actual operation, tariff/free windows, solar and constraints |
| Empty states | No site, no loads, no plan, no history, no forecast, unavailable data |
| Warning banners | Configuration invalid, stale grid input, actuator unavailable, indefinite override, target at risk |
| Responsive layouts | Cards and summaries on mobile; tables only as secondary/detail views |

## Overview Page

### User Questions

- Is the controller healthy?
- What is running right now?
- What will run next?
- Are any targets at risk?
- Is any manual override active?
- Are grid/solar/tariff/battery inputs fresh?

### Proposed Sections

1. **Site status:** state, health, last update, grid import/export, solar, controlled power.
2. **Warnings:** actionable, ranked, dismissible only where safe.
3. **Now running:** load cards with current power, state, reason, and control status.
4. **Next actions:** next load, time, expected power, reason, and target impact.
5. **All loads:** compact cards grouped by status.

### Mobile Rules

- Show one-column cards.
- Keep primary controls at least 44 px high.
- Use a card/list plan summary before any wide table.
- Avoid horizontal scroll for required daily-operation information.

## Loads Page

### User Questions

- Which loads are configured?
- Which loads need attention?
- Which loads are automatic, disabled, or manually overridden?
- How do I open or edit a load?

### Proposed Controls

- Filter chips: all, running, waiting, warning, disabled, overridden.
- Sort menu: status, priority, deadline, type, name.
- Add load button visible to administrators.
- Load cards with type-specific target progress.

## Load Detail Page

### Common Sections

- Header: load name, type, state, automatic status, fault/override chips.
- Decision: plain-language explanation from backend facts.
- Target: runtime, energy, temperature, SOC, or schedule progress.
- Plan: current and next intervals for this load.
- Controls: automatic toggle, timed override, indefinite override, clear override.
- Configuration summary: actuator, feedback, schedule, optimisation mode, safety.
- History: recent events and daily outcomes.

### Type-Specific Content

| Type | Primary content |
| --- | --- |
| Hot water | Temperature, confirmed runtime, guarantee/deadline, thermostat feedback, heating state |
| Pool/generic runtime | Required runtime today, completed runtime, next scheduled run, max starts/min runtime |
| EV charger | Connected/charging, SOC, target SOC, departure, current/power limits |
| Flexible load | Allowed windows, priority, expected power, current plan |
| Battery charger | Charge target, allowed windows, discharge-prevention status, current battery power |

## Plan Page

### User Questions

- What is the controller planning over the next day?
- What tariff/solar conditions influenced the plan?
- Which loads were delayed or rejected, and why?
- Are any hard/soft constraints binding?

### Proposed Sections

- Current interval summary.
- Daily load timeline grouped by load name.
- Price/free-window overlay.
- Solar/forecast overlay.
- Site import/export headroom.
- Proposals and rejections with translated reasons.
- Text/table alternative for every visual timeline.

## Configure Page

### Site Setup Steps

1. Site identity and safety disclaimer.
2. Grid sensors and sign convention.
3. Hard/soft/controlled import limits and phase limits.
4. Solar sensor.
5. Tariffs: fixed, TOU, entity, future entity, hybrid.
6. Free-use windows and feed-in settings.
7. Battery monitoring and discharge-prevention settings.
8. Review, validate, preview, save.

### Load Setup Steps

1. Load identity and type.
2. Actuator.
3. Feedback.
4. Electrical characteristics.
5. Requirement target.
6. Schedule/deadline.
7. Optimisation mode.
8. Safety constraints.
9. Automatic default.
10. Review, validate, preview, save.

## State Model for UI

The UI should visibly distinguish:

- Loading data.
- Reconnecting to HA.
- No site installed.
- Site installed but no loads.
- Ready and healthy.
- Ready with warnings.
- Configuration invalid.
- Sensor stale/unavailable.
- Actuator unavailable.
- Automatic disabled.
- Manual override active.
- Plan unavailable.
- Target at risk or missed.

## Visual Polish Checklist

- Use HA theme variables and native typography.
- Use icons plus text for important statuses.
- Use status chips for state/mode/override/fault.
- Avoid raw enum values in user-facing labels.
- Prefer household names over UUIDs/load IDs.
- Keep advanced JSON behind diagnostics, not routine configuration.
- Provide field-level validation messages and recovery actions.
- Preserve accessible text equivalents for charts and timelines.
- Keep focus order predictable and restore focus after dialogs.

## Implementation Notes

- Keep server-provided reason codes as the stable contract.
- Add display fields instead of replacing existing API fields.
- Do not derive safety authority in the frontend.
- Do not embed validation-environment-specific entity IDs or assumptions.
- Preserve the current typed API gateway and WebSocket namespace.
