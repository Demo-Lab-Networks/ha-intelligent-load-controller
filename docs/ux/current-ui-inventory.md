# Current UI inventory

**Status:** Phase 0 audit of the pre-redesign frontend on branch `ux-redesign-phase-0`.  
**Source inspected:** `frontend/src/components/intelligent-load-controller-panel.ts`, `frontend/src/components/ilc-site-snapshot-chart.ts`, `frontend/src/api/load-control-api.ts`, `custom_components/intelligent_load_controller/websocket_api.py`, and fixture screenshots in `docs/ux/screenshots/current/`.

## Current structure

| Area | Current implementation | Finding |
| --- | --- | --- |
| Root panel | `intelligent-load-controller-panel.ts` is 2,494 lines. | The component owns shell, navigation, page rendering, state management, API orchestration, configuration editor, load controls, dialogs, and most CSS. It is the main maintainability risk. |
| Components | `components/` contains the root panel and `ilc-site-snapshot-chart.ts` only. | There are no page components, reusable layout/status/control components, load-type components, or design token modules yet. |
| API client | `load-control-api.ts` maps backend V1 WebSocket commands into frontend models. | The client is typed and useful, but presentation-specific fields are minimal. Frontend currently derives too much copy/shape from generic fields. |
| Navigation | Four workspace buttons: Dashboard, Plan, History, Configure. Load detail is an internal state reached from cards. | It is not the required route-aware Overview/Loads/Plan/Insights/Settings/Diagnostics IA. Paths map only partially (`/plan`, `/history`, `/configure`, `/load/:id`). |
| Dashboard | Metrics grid with many equal-weight cards, site snapshot chart, controlled load cards. | It does not provide a strong Home Status hero, attention ranking, clear “next/why”, or active/upcoming grouping. |
| Load cards | Generic metadata grid and actions. | Cards are not genuinely HWS/EV/battery/generic aware. Primary action and target vocabulary are generic. |
| Plan | Plan narrative is minimal and plan/timeline content is mainly tables. | A visual Gantt/tariff/source workspace is missing. |
| History | Daily summaries and event journal are table-like; daily summary values can fall back to JSON-like rendering. | Ordinary users see technical data instead of designed insights. |
| Configuration | Basic forms and generated controls for site/load draft editing. | It is not yet a guided setup or type-specific wizard. Schedule editing is not visual. |
| Accessibility | Existing Playwright + axe smoke tests cover empty/populated states. | Wider route, keyboard, mobile, theme, chart alternative, and form-error evidence is still required. |

## Current screenshot evidence

Baseline fixture screenshots were captured from the local Vite harness on 2026-07-23. They use simulated Home Assistant data and theme variables only; they are not live HAOS screenshots.

| State/page | Desktop light/dark | Mobile light/dark |
| --- | --- | --- |
| Overview/dashboard | `overview-desktop-light.png`, `overview-desktop-dark.png` | `overview-mobile-light.png`, `overview-mobile-dark.png` |
| Plan | `plan-desktop-light.png`, `plan-desktop-dark.png` | `plan-mobile-light.png`, `plan-mobile-dark.png` |
| History/current insights | `insights-current-history-desktop-light.png`, `insights-current-history-desktop-dark.png` | `insights-current-history-mobile-light.png`, `insights-current-history-mobile-dark.png` |
| Configuration/current settings | `settings-current-configure-desktop-light.png`, `settings-current-configure-desktop-dark.png` | `settings-current-configure-mobile-light.png`, `settings-current-configure-mobile-dark.png` |
| Load detail/current load controls | `load-detail-desktop-light.png`, `load-detail-desktop-dark.png` | `load-detail-mobile-light.png`, `load-detail-mobile-dark.png` |
| Empty loads | `empty-loads-desktop-light.png`, `empty-loads-desktop-dark.png` | `empty-loads-mobile-light.png`, `empty-loads-mobile-dark.png` |

Capture notes:

- Current harness pages emit expected Lit dev-mode warnings.
- The chart emitted ECharts zero-width and duplicate-instance warnings in several fixture captures. This is not a blank-panel regression, but Phase 1/2 should harden chart lifecycle and sizing before visual-regression baselines are treated as stable.
- Live HAOS screenshots, Home Assistant version, frontend version, HACS version, and browser metadata remain Phase 6/live validation evidence.

## Current WebSocket surface

Backend V1 commands currently include:

- Site/load reads: `site_list`, `site_summary`, `load_list`, `load_detail`
- Plan/history: `current_plan`, `daily_timeline`, `historical_summary`, `event_journal`
- Configuration: `configuration_schema`, `configuration_read`, `configuration_validate`, `configuration_preview`, `configuration_update`, load CRUD
- Operations: `override_start`, `override_clear`, `automatic_control_set`, `replan`, CSV export
- Diagnostics/learning: `diagnostics`, `learning_status`, `learning_reset`, `learning_freeze`
- Subscriptions: scoped `subscribe_updates`

The contract is sufficient for basic functional pages but not yet rich enough for a polished presentation layer because it lacks backend-ranked attention, site hero copy, energy-flow nodes/edges, type-specific summary fields, plan narratives, and display-ready activity feed entries.

