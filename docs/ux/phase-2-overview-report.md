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
  - operational load groups: Needs attention, Running now, Starting soon, Waiting, and Complete.
- Updated load summary cards with type labels, type icons, contextual status phrases, fewer visible metadata fields, and stronger state/fault/manual/target hierarchy.
- Preserved optional chart failure fallback and the existing locally bundled ECharts snapshot.
- Preserved the backend authority boundary: the frontend uses typed backend fields, stable controller state, target status, manual override state, measurements, and reason codes. It does not calculate safety, allocation, deadlines, or action eligibility.
- Fixed the frontend API facade to preserve optional `site_summary` fields already represented in the model/harness: grid import/export, solar production, cost/energy today, and next deadline.
- Added a first optional V1 `site_summary.attention[]` backend presentation field. The coordinator now ranks current warnings and manual overrides with stable code, reason code, severity, affected object, and action destination; the Overview prefers this feed when present and keeps the previous typed-field fallback for compatibility.

No planner, electrical safety, actuator, override, or optimisation semantics were changed.

## Source structure movement

| Area | Before this slice | After this slice |
| --- | --- | --- |
| Overview page | Legacy page module rendered metric grid, chart, and ungrouped load cards | Page composes feature mapper plus reusable Overview/energy/load components |
| Feature layer | No `frontend/src/features/` implementation | `frontend/src/features/overview/overview-presentation.ts` |
| Overview components | Embedded in page/root | `frontend/src/components/overview/` and `frontend/src/components/energy/` |
| Load card | Generic metadata grid | Contextual/type-aware summary card |

## Evidence

| Check | Result |
| --- | --- |
| `npm --prefix frontend run typecheck` under Node 22.23.0 | Passed |
| `npm --prefix frontend run test` under Node 22.23.0 | 4 files passed; 24 tests passed |
| `npm --prefix frontend run test:e2e` under Node 22.23.0 | 4 Playwright tests passed |
| `scripts/build-frontend && scripts/validate-frontend-bundle` | Passed; bundle size 1,654,795 bytes |
| `python3 -m py_compile custom_components/intelligent_load_controller/coordinator.py tests/integration/test_coordinator.py tests/websocket/test_websocket_api.py` | Passed |
| `scripts/test-backend tests/integration/test_coordinator.py tests/websocket/test_websocket_api.py -q` | Blocked in this shell: Python 3.13 interpreter unavailable |

Browser console notes from Playwright:

- Expected local Vite/Lit dev-mode warning appears in dev-server runs.
- Production-bundle tests still confirm the panel registers without Node browser globals and remains visible if the optional chart component fails.

## Phase 2 exit-gate assessment

| Gate | Assessment |
| --- | --- |
| Overview answers the seven five-second questions | Partially satisfied locally: current grid flow, running/waiting loads, target summary, attention, next action/deadline fallback, reason-code explanation, and load actions are visible. More backend presentation fields and live HAOS evidence remain required. |
| No wall of equal-weight metrics remains | Satisfied for this slice: the legacy eleven-card metric wall was replaced with hero, flow, attention, and six focused KPIs. |
| Every configured load type has an appropriate summary card | Partially satisfied: HWS, EV, battery, and generic labels/vocabulary exist, but type-specific data fields depend on future backend presentation fields. |
| Attention states are backend-authoritative | Improved but still partial: current warning and override attention now prefers backend-ranked `site_summary.attention[]` with rank/severity/action. Target-risk, impossible-target, deadline, tariff, and opportunity attention still need richer backend presentation sources before full Phase 2 exit. |

## Known limits intentionally carried forward

- The live energy flow uses available aggregate fields and does not yet render canonical backend `energy_flow_nodes[]`/`energy_flow_edges[]`.
- The attention list now has a backend-ranked warning/override starter contract, but it does not yet cover all Phase 2 attention categories.
- The Today timeline is not implemented in this slice.
- Load cards have type-aware labels and vocabulary but do not yet include full HWS/EV/battery/generic presentation models.
- Plan and Insights remain largely legacy/table-oriented.
- No live `https://home-dev.iot.delongis.net` screenshot/console evidence was captured in this slice.

## Recommended next work

1. Extend optional backend presentation fields for `site_summary.presentation`, additional `site_summary.attention[]` sources, and richer `load_list` display fields with schema/contract tests.
2. Add the compressed Today timeline using existing `daily_timeline`/plan intervals, with a textual alternative.
3. Continue load-card refinement once backend display fields expose target labels, source breakdown, next action metadata, and action eligibility.
4. Capture refreshed Overview screenshots at the required Phase 2 viewports after the fixture/harness can represent HWS, EV, battery, warning, fault, and override states.
