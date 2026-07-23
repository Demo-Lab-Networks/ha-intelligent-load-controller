# UX redesign Phase 2 Overview starter report

**Branch:** `ux-redesign-phase-1-shell`
**Date:** 2026-07-23
**Scope:** First production Overview redesign slice. This starts Phase 2; it does not complete the full Phase 2 exit gate.

## Delivered in this slice

- Added `frontend/src/features/overview/overview-presentation.ts` as a deterministic display-model mapper for Overview-only presentation state.
- Added reusable Overview components:
  - `ilc-home-status-hero`
  - `ilc-energy-flow-card`
  - `ilc-attention-list`
  - `ilc-today-kpis`
- Replaced the legacy wall of equal-weight site metric cards with:
  - a compact Home Status hero;
  - live energy-flow summary with textual alternative;
  - backend-ranked attention/opportunity list when the optional backend feed is available, with typed-field fallback compatibility;
  - a focused Today summary KPI cluster;
  - a compressed Today timeline from the read-only backend `daily_timeline` endpoint, with textual summary and Plan/load navigation;
  - operational load groups: Needs attention, Running now, Starting soon, Waiting, and Complete.
- Updated load summary cards with type labels, type icons, contextual status phrases, fewer visible metadata fields, and stronger state/fault/manual/target hierarchy.
- Added `frontend/src/features/loads/load-card-presentation.ts` so load-card state phrases, badges, progress labels, and primary actions are deterministic, type-aware, and unit-tested instead of embedded in the card component.
- Added `frontend/src/features/loads/load-catalogue.ts` and upgraded the dedicated Loads route with local search, status/type filters, sort controls, and status/type/area/priority grouping over the existing read-only backend `load_list` summaries.
- Preserved optional chart failure fallback and the existing locally bundled ECharts snapshot.
- Preserved the backend authority boundary: the frontend uses typed backend fields, stable controller state, target status, manual override state, measurements, and reason codes. It does not calculate safety, allocation, deadlines, or action eligibility.
- Fixed the frontend API facade to preserve optional `site_summary` fields already represented in the model/harness: grid import/export, solar production, cost/energy today, and next deadline.
- Added a first optional V1 `site_summary.attention[]` backend presentation field. The coordinator now ranks current warnings, manual overrides, persisted runtime actuator faults, and invalid load configurations with stable code, reason code, severity, affected object, and action destination; the Overview prefers this feed when present and keeps the previous typed-field fallback for compatibility.
- Extended the backend-ranked `site_summary.attention[]` feed to cover plan-derived impossible targets, at-risk targets, and approaching load deadlines. Hard runtime/configuration faults still outrank target warnings for the same load.
- Added a read-only `fault` flag to load summaries when persisted runtime fault evidence exists, allowing the card/list presentation to surface actuator failure without changing control policy.
- Added backend-owned load summary card fields for measured current power, configured deadline, and the next planned start/stop action from the stored backend plan. The card renders the structured time/kind/reason-code fields and keeps the older raw `next_action` fallback.
- Added backend-owned load summary target progress and target status fields. Runtime and energy progress come from bounded recovery accounting, SOC/temperature progress comes from observed feedback or persisted feedback evidence, and target risk comes from stored backend plan results/deadline evidence. Missing evidence is surfaced as `unknown` rather than fabricated as on-track.
- Added a resilient Overview `ilc-today-timeline` component. It renders backend-provided plan intervals as a compact visual strip, keeps a screen-reader/text summary, opens affected loads or the full Plan route, and leaves the dashboard usable when the timeline read is unavailable.
- Added an optional V1 `site_summary.presentation` payload for the Home Status hero. The backend now supplies stable status/summary codes, summary values, grid-flow direction, target counts for target-bearing loads, the primary decision reason, and the next planned load action/time/reason from stored plan evidence. The panel prefers those fields and falls back to the previous typed-field derivation when they are absent.

No planner, electrical safety, actuator, override, or optimisation semantics were changed.

## Source structure movement

| Area | Before this slice | After this slice |
| --- | --- | --- |
| Overview page | Legacy page module rendered metric grid, chart, and ungrouped load cards | Page composes feature mapper plus reusable Overview/energy/load components |
| Feature layer | No `frontend/src/features/` implementation | `frontend/src/features/overview/overview-presentation.ts` |
| Load-card presentation | Component-local conditional copy | `frontend/src/features/loads/load-card-presentation.ts` derives HWS/EV/battery/generic card vocabulary and safe primary action labels |
| Overview components | Embedded in page/root | `frontend/src/components/overview/` and `frontend/src/components/energy/` |
| Timeline | Table-only Plan route | Compact Overview timeline component backed by existing `daily_timeline` plus full Plan route link |
| Load card | Generic metadata grid | Contextual/type-aware summary card |
| Loads page | Static card grid | Searchable, sortable, filterable, grouped load catalogue using deterministic presentation rules |

## Evidence

| Check | Result |
| --- | --- |
| `npm --prefix frontend run typecheck` under Node 22.23.0 | Passed |
| `npm --prefix frontend run test` under Node 22.23.0 | 8 files passed; 39 tests passed |
| `npm --prefix frontend run test:e2e` under Node 22.23.0 | 4 Playwright tests passed |
| `npm --prefix frontend run build` under Node 22.23.0 and `scripts/validate-frontend-bundle` | Passed; bundle size 1,697,009 bytes |
| `python3 -m compileall -q custom_components/intelligent_load_controller tests/integration/test_coordinator.py` | Passed |
| `RUFF_CACHE_DIR=.tmp-ruff-cache .tmp-ruff/bin/ruff format --check ... && .tmp-ruff/bin/ruff check ...` for touched backend files | Passed |
| `scripts/test-backend tests/integration/test_coordinator.py -k home_status -q` | Blocked in this shell: no Python 3.13 executable on PATH; direct `python3` is 3.14 and lacks pytest/Home Assistant harness dependencies |

Browser console notes from Playwright:

- Expected local Vite/Lit dev-mode warning appears in dev-server runs.
- Production-bundle tests still confirm the panel registers without Node browser globals and remains visible if the optional chart component fails.

## Phase 2 exit-gate assessment

| Gate | Assessment |
| --- | --- |
| Overview answers the seven five-second questions | Partially satisfied locally: current grid flow, running/waiting loads, target summary, attention, next planned action/deadline fallback, reason-code explanation, quick actions, and compressed planned intervals are visible. The Home Status hero now prefers backend-owned presentation fields. More tariff/opportunity presentation fields and live HAOS evidence remain required. |
| No wall of equal-weight metrics remains | Satisfied for this slice: the legacy eleven-card metric wall was replaced with hero, flow, attention, and six focused KPIs. |
| Every configured load type has an appropriate summary card | Improved but still partial: HWS, EV, battery, and generic cards now have type-aware state phrases, progress labels, badges, measured power/deadline/progress/target-status/next-action fields where backend data exists, and contextual primary actions. Full type-specific fields still depend on future backend presentation models. |
| Attention states are backend-authoritative | Improved but still partial: warning, override, runtime actuator-fault, invalid-load, target-risk, impossible-target, and approaching-deadline attention now prefer backend-ranked `site_summary.attention[]` with rank/severity/action. Tariff and opportunity attention still need richer backend presentation sources before full Phase 2 exit. |

## Known limits intentionally carried forward

- The Home Status hero now has a starter backend-owned presentation payload, but it does not yet include richer freshness/source attribution, action eligibility, or full decision narrative fields.
- The live energy flow uses available aggregate fields and does not yet render canonical backend `energy_flow_nodes[]`/`energy_flow_edges[]`.
- The attention list now has a backend-ranked warning/override/runtime-fault/invalid-load/target/deadline contract, but it does not yet cover tariff/free-period/solar opportunity categories.
- The Today timeline is a starter compressed interval strip. It does not yet include tariff bands, solar/export bands, actual/manual/blocked categories, deadline markers, or zoom; those remain Phase 4/plan-workspace items unless backend presentation fields arrive earlier.
- Load cards have type-aware labels, vocabulary, badges, measured power, configured deadlines, progress/status, structured next plan action, and primary actions, but do not yet include full HWS/EV/battery/generic backend presentation models such as source contribution, expected completion, rich target projection, boost presets, or action eligibility.
- Loads catalogue area grouping uses optional `load_list` area metadata when present and otherwise places loads into an explicit “No area assigned” group; full area/circuit/category grouping still needs backend presentation fields.
- Plan and Insights remain largely legacy/table-oriented.
- No live `https://home-dev.iot.delongis.net` screenshot/console evidence was captured in this slice.

## Recommended next work

1. Extend optional backend presentation fields for tariff/opportunity `site_summary.attention[]` sources, richer `site_summary.presentation` freshness/action-eligibility/narrative fields, and richer `load_list` display fields with schema/contract tests.
2. Add richer backend presentation categories for timeline intervals (`kind`, source, deadline/actual/manual/blocked markers) before expanding the visual into the full Plan workspace.
3. Add backend load presentation fields for area/category/circuit metadata, source breakdown, expected completion, boost presets, and action eligibility.
4. Capture refreshed Overview and Loads screenshots at the required Phase 2 viewports after the fixture/harness can represent HWS, EV, battery, warning, fault, override, timeline, and grouped-catalogue states.
