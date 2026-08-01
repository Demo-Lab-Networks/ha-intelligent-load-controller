# Product Roadmap

**Baseline:** `5eb6f50f57745c25771ae03ab1045af67d3ea32f`
**Version:** `0.2.0`
**Status:** Audit-derived implementation plan. Do not treat a phase as complete until its acceptance evidence is committed.

## Delivery Cycle

Every implementation phase uses this cycle:

```text
public controller feature branch
    -> backend and frontend CI
    -> exact commit pin in the live validation harness
    -> native Home Assistant backup of the validation environment
    -> deploy exact pinned commit
    -> targeted or full live scenario validation
    -> evidence and defects
    -> merge through protected workflow
    -> pin merged main commit
    -> final smoke validation
```

Do not add validation-harness code to this public repository. Public changes should add controller code, frontend code, documentation, and public test fixtures only.

## Phase 1: Information Architecture and Navigation

**Complexity:** Medium
**Implementation status:** Implemented and locally validated on `feat/phase1-information-architecture`; pending live validation harness evidence before merge.

**User problem:** The current panel is usable as an engineering console, but a household user cannot quickly answer "what is happening now?" and an administrator cannot see a clear path from setup to operation.

**Desired experience:** A Home Assistant-native sidebar with clear top-level sections: Overview, Loads, Plan, History, Configure, Diagnostics. The default page shows site identity, health, data freshness, running loads, next actions, and actionable warnings. Empty and no-site states point users to the right HA settings or panel action.

**Backend work:**

- Add display-ready site health/freshness fields where they are currently implicit.
- Add load display names to plan/proposal responses while preserving `load_id`.
- Keep WebSocket additions backward compatible.

**Frontend work:**

- Split the monolithic panel into route/section components.
- Replace raw tab labels with HA-style page headers, section cards, status chips, and icons.
- Add mobile-first alternatives for table-heavy views.
- Add explicit "Now", "Next", "Warnings", and "Loads" sections.
- Standardise product naming as "Intelligent Load Controller" externally and "Load Control" only where intentionally short.

**Entity/API changes:** Additive WebSocket response fields only.

**Migration impact:** None expected.

**Tests:**

- Vitest for route selection, empty/no-site/multi-site states, display-name plan rows, warning banners, and mobile rendering logic.
- Playwright + axe for overview, empty installation, direct load route, keyboard navigation, and narrow viewport.

**Harness scenarios:**

- Covered by existing targeted smoke for startup/load list/replan/reload/restart/isolation.
- Add screenshot/evidence capture for overview on desktop and mobile after deployment.

**Risks:**

- UI refactor could regress existing panel loading/reconnect behavior.
- Display-name additions must remain backward compatible for existing WebSocket consumers.

**Acceptance criteria:**

- A user can identify site health, current controlled power, active loads, and next action on first view.
- No table is the only usable mobile representation for core overview content.
- Direct load routes recover after refresh/reconnect.
- Existing backend behavior and live smoke validation remain unchanged.

**Implementation evidence:**

- Primary IA pages: Overview, Loads, Plan, Site, Settings.
- Secondary compatibility route: History.
- Overview is the default page and shows existing site metrics, warning state, now-running loads, next actions, snapshot, and links to primary pages.
- Loads and Load detail are separated; invalid load routes show a safe not-found state.
- Plan keeps existing plan/timeline/proposal data and adds a card summary before the table view.
- Site presents existing site state, live inputs, health, and configured constraints without changing configuration semantics.
- Settings preserves the existing Home Assistant-backed configuration, validation, preview, save, load add/edit/duplicate/delete, automatic control, and override paths.
- Empty, loading, reconnecting, section-loading, API-error, no-site, no-load, no-plan, and missing-load states are handled in the shell.
- Frontend tests cover default route, primary nav, selected state, load list/detail, missing load, no-site, no-load, no-plan, API failure, narrow route smoke, action reachability, route restoration, and no blank page regression.
- Backend planner, arbitrator, actuation, entity contracts, safety behavior, and version remain unchanged.

## Phase 2: Site Dashboard and Decision Transparency

**Complexity:** Medium

**User problem:** Reason codes and plan tables exist, but users cannot understand decisions in plain language or see the relationship among solar, tariff, constraints, and current load state.

**Desired experience:** Each site/load has an "Explain decision" surface that states why the controller is allowing, delaying, blocking, or stopping a load, what inputs mattered, and what happens next. Site warnings are actionable and ranked.

**Backend work:**

- Extend decision reports with display-ready explanation facts: selected reason, affected constraint, relevant sensor freshness, current interval, next eligible interval, target status, and unmet work.
- Include a load-name map and grouped plan summaries.
- Expose warning severity and recommended recovery action.

**Frontend work:**

- Add explanation panels on overview, load cards, and load detail.
- Render warning banners with severity, affected load/entity, and fix route.
- Highlight current interval and next planned action.
- Show "current state" and "planned state" separately.

**Entity/API changes:** Additive fields to `site_summary`, `load_list`, `current_plan`, and `event_journal`.

**Migration impact:** None expected.

**Tests:**

- Backend tests for explanation facts and stable reason-code mapping.
- Vitest for decision explanation rendering and warnings.
- Playwright for household daily-operation path.

**Harness scenarios:**

- Existing scenarios: high solar, low solar peak, stale forecast, import limit contention, EV disconnected.
- New targeted scenario: verify explanation text for delayed/blocked load, stale sensor, and active manual override.

**Risks:**

- Client must not invent safety explanations from partial data.
- Explanation text should be localisable and stable enough for tests.

**Acceptance criteria:**

- Every load card can explain on/off/delayed/blocked state in household language.
- Warnings include a concrete next action or clearly state when no action is possible.
- Plan rows use load names and reason text while retaining IDs for diagnostics.

## Phase 3: Load Setup and Detail Experiences

**Complexity:** Large

**User problem:** Add/edit flows do not expose the fields needed to configure hot water, pool, EV, flexible load, or battery charger safely.

**Desired experience:** Guided type-aware load wizards with HA entity selectors, current-value previews, sensible defaults, validation, and a review step. Per-load detail pages show status, target progress, schedule, next action, history, and controls tailored to the load type.

**Backend work:**

- Add schema metadata for field groups, selectors, units, defaults, and mode/type dependencies.
- Improve validation issue paths and messages for field-level display.
- Return type-specific progress fields for runtime, energy, temperature, and SOC targets.

**Frontend work:**

- Build type-aware load setup flows for hot water, pool/generic runtime, EV, generic flexible load, and battery charger.
- Add entity selectors and live current-value/freshness hints.
- Add load detail sections for target, schedule, feedback, actuator, automatic control, override, and history.
- Add duplicate/delete/reconfigure review screens.

**Entity/API changes:** Add schema metadata endpoint fields; additive load detail fields.

**Migration impact:** Existing stored load configs remain valid; migrations not expected unless schema metadata requires version bump.

**Tests:**

- Backend config validation tests per load type.
- Vitest for each wizard and validation/revision conflict path.
- Playwright for add/edit/duplicate/delete all supported load types.

**Harness scenarios:**

- Existing: hot water, pool pump, EV connected/disconnected, flexible load actuator smoke.
- New: configure each load from scratch in a controlled Home Assistant validation environment or simulated panel facade; invalid entity recovery; duplicate actuator rejection UI.

**Risks:**

- Wizard complexity can drift from canonical backend schema.
- Entity selectors must remain generic and not embed validation-environment IDs.

**Acceptance criteria:**

- A normal HA administrator can configure each supported load without editing JSON.
- Invalid/missing entities are caught before automatic authority is granted.
- Load detail pages use household names and type-specific progress language.

## Phase 4: Scheduling, Forecasts, and Planning Visualisation

**Complexity:** Large

**User problem:** Schedules, free windows, tariff periods, price forecasts, and solar forecasts are supported in the backend but not visible enough to understand or configure confidently.

**Desired experience:** A daily timeline shows planned and actual operation by load, with tariff/free/solar/constraint overlays, current time, deadlines, and forecast quality. Configuration includes a visual weekly schedule editor with exact-time fallback.

**Backend work:**

- Return grouped timeline rows with load name, segment kind, power, expected cost, solar allocation, and reason.
- Return tariff/free-window/forecast intervals and data-quality status.
- Add forecast-vs-actual summary data when available.

**Frontend work:**

- Add Gantt-style load timeline with accessible text table.
- Add price/solar/constraint overlays and series toggles.
- Add weekly schedule editor with copy-day, overnight, validation, and exact time controls.
- Show preview plans before material saves.

**Entity/API changes:** Additive timeline/forecast endpoints or expanded `daily_timeline`.

**Migration impact:** Existing schedules remain valid.

**Tests:**

- Backend tests for grouped interval shape and schedule/DST display data.
- Vitest for timeline, schedule editor, and preview warnings.
- Playwright for mobile schedule editing and accessibility.

**Harness scenarios:**

- Existing: market price response 5/30 min, high solar, low solar, stale forecast.
- New: free-use tariff window visualisation, overnight schedule, missing forecast quality, forecast-vs-actual evidence.

**Risks:**

- Timeline can become too dense on mobile.
- Forecast quality must be honest; do not hide stale/gapped data.

**Acceptance criteria:**

- Users can see why a future interval was chosen against tariff/solar/constraint context.
- Schedules can be created and corrected without YAML or JSON.
- Preview is visibly non-actuating and cannot mutate runtime state.

## Phase 5: Overrides, Degraded States, and Operational Controls

**Complexity:** Medium

**User problem:** Manual override, automation disable, missing sensors, and unavailable actuators have safe backend semantics but need clearer product treatment.

**Desired experience:** Manual actions are explicit, bounded where possible, confirmed when material, and visibly reversible. Indefinite overrides show persistent warnings. Degraded states explain whether the controller is observing, disabled, blocked, faulted, or waiting.

**Backend work:**

- Return override expiry/origin/status consistently in summaries.
- Return pending feedback and actuator-test status where available.
- Add recovery-action metadata to faults/repairs.

**Frontend work:**

- Add override confirmation and extend/cancel controls.
- Add persistent override banners.
- Add automation disable explanation and re-enable flow.
- Add degraded-state cards for stale grid input, unavailable actuator, missing forecast, and configuration conflict.

**Entity/API changes:** Additive summary/status fields.

**Migration impact:** Existing overrides retain absolute expiry semantics.

**Tests:**

- Backend tests for override resume/expiry/status payload.
- Vitest for timed/indefinite/clear/extend UI and unavailable states.
- Playwright for override keyboard flow and restart-recovery display.

**Harness scenarios:**

- Existing: reload, restart, EV disconnected, actuator smoke, isolation.
- New: indefinite override survives restart with warning; stale grid input fail-closed UI; unavailable actuator recovery UI.

**Risks:**

- Manual actions are safety-sensitive; UI copy must match backend authority exactly.
- Do not expose unbounded actuator tests.

**Acceptance criteria:**

- Users always see when automation is disabled or a manual override is active.
- Clearing/enabling automation leads to a fresh backend replan.
- Degraded states are actionable and do not imply unsafe fallback behavior.

## Phase 6: Advanced Optimisation and Learning

**Complexity:** Large

**User problem:** Advanced modes, conservative learning, forecast confidence, and performance outcomes are partly implemented but not productised.

**Desired experience:** Advanced users can tune optimisation modes and learning safely, while ordinary users see outcomes: target completion, cost, solar use, grid impact, and confidence. Battery discharge support requires a separate product decision.

**Backend work:**

- Expand learning status summaries and confidence explanations.
- Add performance outcome summaries for cost, energy, solar allocation, target completion, and missed opportunities.
- Decide whether generic battery discharge belongs in V1/V2 and design a safety model before implementation.

**Frontend work:**

- Add optimisation-mode help and mode comparison.
- Add learning status, reset/freeze, conservative estimate explanation, and confidence display.
- Add performance summaries and forecast confidence indicators.
- Add advanced battery UX only after backend product decision.

**Entity/API changes:** Additive learning/performance fields; possible new battery model in a future version.

**Migration impact:** Battery discharge support may require schema migration and clear upgrade notes.

**Tests:**

- Backend learning and performance summary tests.
- Vitest for learning controls/outcomes.
- Simulation for forecast confidence and full-year outcomes.

**Harness scenarios:**

- Existing: deterministic simulation, battery min/max SOC, market price, solar forecast error.
- New: learning cold start/outlier/reset/freeze; performance summary; battery discharge only after product decision.

**Risks:**

- Optimisation claims can exceed evidence.
- Learning must never lower safety estimates or hard limits.
- Battery discharge is materially more complex than charger-style control.

**Acceptance criteria:**

- Users can understand optimisation mode consequences before changing them.
- Learning displays confidence and remains conservative.
- Outcome summaries match backend evidence and are covered by simulation/live validation.

## Recommended First Implementation Phase

Start with **Phase 1**. It improves usability and visual polish while keeping the validated controller semantics stable. It also creates the UI structure needed for the later, more complex configuration and planning work.
