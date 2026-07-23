# UX redesign Phase 1 shell report

**Branch:** `ux-redesign-phase-1-shell`  
**Date:** 2026-07-23  
**Scope:** Route-aware application shell foundation and visual baseline. This is a Phase 1 implementation slice, not final redesign completion.

**Follow-up:** The subsequent Phase 2 starter slice begins replacing the legacy Overview hierarchy. See [Phase 2 Overview starter report](phase-2-overview-report.md) for current Overview evidence.

## Delivered in this slice

- Added a typed route model for:
  - `/intelligent-load-controller`
  - `/intelligent-load-controller/loads`
  - `/intelligent-load-controller/loads/:loadId`
  - `/intelligent-load-controller/plan`
  - `/intelligent-load-controller/insights`
  - `/intelligent-load-controller/settings`
  - `/intelligent-load-controller/diagnostics`
- Preserved compatibility aliases for existing `/dashboard`, `/history`, `/configure`, and `/load/:loadId` paths.
- Added shell primitives under `frontend/src/app/`:
  - `ilc-app-shell`
  - `ilc-navigation`
  - `ilc-router`
- Added initial reusable feedback/status primitives:
  - `ilc-alert`
  - `ilc-empty-state`
  - `ilc-status-pill`
- Added semantic design tokens in `frontend/src/design/tokens.ts`.
- Extracted legacy panel styles into `frontend/src/styles/panel.ts`.
- Added a dedicated Loads route and read-only Diagnostics route while keeping existing page actions and backend calls intact.
- Added URL writes for navigation clicks and browser `popstate` handling.
- Updated the local Playwright harness so direct URLs can be tested.
- Fixed a chart initialization race that produced duplicate Apache ECharts instance warnings during repeated renders.
- Extracted presentational page modules for Overview, Loads, load detail, Plan, Insights, Settings, and Diagnostics.
- Extracted shared load-summary and plan-table/proposal components.
- Replaced raw JSON daily-summary rendering in the ordinary Insights view with a labelled field list and Diagnostics fallback text for complex values.
- Moved legacy load override/Automatic controls and Settings/configuration forms behind page components that dispatch intent events back to the root panel.
- Rebuilt the committed integration frontend bundle.

No planner, electrical safety, actuator, override, or optimisation semantics were changed.

## Source structure movement

| Area | Before | After this slice |
| --- | --- | --- |
| Root panel | `frontend/src/components/intelligent-load-controller-panel.ts`, 2,494 lines at Phase 0 audit | 1,331 lines |
| App shell/router | none | `frontend/src/app/`, 299 lines |
| Shared style/tokens | placeholder only | `frontend/src/design/tokens.ts`, `frontend/src/styles/panel.ts` |
| Feedback/status primitives | embedded in panel | `frontend/src/components/feedback/`, `frontend/src/components/status/` |
| Page modules | none | `frontend/src/pages/`, 1,149 lines |
| Shared load/plan components | embedded in panel | `frontend/src/components/loads/`, `frontend/src/components/plans/`, 275 lines |

The root panel remains larger than the final target and still owns backend/API orchestration, cross-route state, and dialog focus state. Further Phase 1 work should continue extracting shared state and feature-specific presentation/state boundaries before claiming the full Phase 1 exit gate.

## Evidence

| Check | Result |
| --- | --- |
| `npm --prefix frontend run typecheck` under Node 22.23.0 | Passed |
| `npm --prefix frontend run test` under Node 22.23.0 | 3 files passed; 17 tests passed |
| `scripts/build-frontend` under Node 22.23.0 | Passed |
| `scripts/validate-frontend-bundle` | Passed; bundle size 1,619,052 bytes |
| `npm --prefix frontend run test:e2e` under Node 22.23.0 | 4 Playwright tests passed |
| Local visual baseline | 22 screenshots captured under `docs/ux/screenshots/phase-1-shell/` |
| Dev Home Assistant panel rendering | User reported the installed sidebar panel is no longer blank |

Browser console notes from Playwright:

- Expected local Vite/Lit dev-mode warning appears in dev-server runs.
- The prior duplicate ECharts instance warning is no longer present after the chart creation guard.

## Phase 1 exit-gate assessment

| Gate | Assessment |
| --- | --- |
| Existing functionality remains reachable | Partially satisfied in fixture tests: dashboard, load controls, plan, insights/history, settings/configuration, diagnostics, and production no-blank paths remain reachable. Live HAOS validation remains required. |
| Direct routes work | Partially satisfied: unit test covers `/loads/:loadId`; fixture screenshots cover all top-level routes. Live HAOS refresh/back-forward evidence remains required. |
| Mobile navigation works | Partially satisfied: screenshots cover 320×700 and 390×844 with the bottom primary nav. Touch/keyboard walkthrough remains required. |
| No regression to blank-page handling | Satisfied for local evidence: production-bundle Playwright tests passed, including optional chart failure fallback. |
| Root panel is no longer a mega-component | Partially satisfied. Shell, router, styles, primitives, Overview, Loads, load detail, Plan, Insights, Settings, Diagnostics, load cards, and plan tables are extracted. Root panel remains 1,331 lines and still owns API orchestration, shared route state, and dialogs. |
| Visual regression baselines exist | Partially satisfied: local fixture baselines exist for core routes/viewports/themes. Live HAOS and richer state baselines remain required. |

## Known limits intentionally carried forward

- Overview-specific hierarchy is superseded by the Phase 2 starter report.
- Load cards now have initial type-aware labels and vocabulary, but full backend presentation models remain future work.
- Plan remains table-first/legacy.
- Insights still uses a table layout, but ordinary daily summaries no longer render raw JSON.
- Settings remains a form-first configuration page, not the guided wizard.
- Load controls now have a page boundary but remain generic and not yet the Phase 3 type-aware dashboard.
- Diagnostics exposes raw data only in the explicitly developer-labelled route.
- No live `https://home-dev.iot.delongis.net` evidence was captured in this slice because no credentials were available in the repo context.

## Recommended next work

1. Continue Phase 1 by extracting shared state and feature-specific boundaries into `frontend/src/features/` and `frontend/src/state/`.
2. Add route-level Playwright tests for Overview, Loads, load detail, Plan, Insights, Settings, and Diagnostics.
3. Add keyboard-focused navigation tests and mobile touch-target checks.
4. Start Phase 2 Overview work only after the shell/page boundaries are stable enough that the hero, attention feed, and load cards do not deepen the root component again.
