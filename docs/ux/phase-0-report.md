# UX redesign Phase 0 report

**Branch:** `ux-redesign-phase-0`  
**Date:** 2026-07-23  
**Scope:** Discovery, audit, design contract, and implementation plan. No production frontend behaviour changes.

## Delivered artifacts

| Artifact | Purpose |
| --- | --- |
| `docs/ux/reference-benchmark.md` | Official reference synthesis and design principles. |
| `docs/ux/current-ui-inventory.md` | Current frontend inventory, source measurements, screenshot index, and WebSocket surface audit. |
| `docs/ux/gap-analysis.md` | Gap analysis against `FRONTEND_UX_SPECIFICATION.md` and redesign goal. |
| `docs/ux/information-architecture.md` | Target route-aware IA and navigation rules. |
| `docs/ux/user-journeys.md` | Everyday, investigation, plan, configuration, fault, and mobile journeys. |
| `docs/ux/design-system.md` | Semantic token and component primitive contract. |
| `docs/ux/backend-presentation-gap-analysis.md` | Optional backend presentation fields and schema-test requirements. |
| `docs/ux/wireframes.md` | Low-fidelity page sketches. |
| `docs/ux/prototypes/phase-1-shell.html` | Project-owned HTML prototype of the Phase 1 shell direction. |
| `docs/architecture/adr/0007-route-aware-panel-shell-and-navigation.md` | Navigation/router decision. |
| `docs/architecture/adr/0008-local-component-system-and-design-tokens.md` | Local component system/design token decision. |
| `docs/architecture/adr/0009-charting-and-energy-visualisation-contract.md` | Charting and visualisation decision. |
| `frontend/src/design/README.md`, `frontend/src/styles/README.md` | Reserved source directories for Phase 1 architecture. |
| `docs/ux/screenshots/current/*.png` | Current fixture screenshots for desktop/mobile and light/dark modes. |

## Evidence captured

- Source structure measured:
  - `frontend/src/components/intelligent-load-controller-panel.ts`: 2,494 lines.
  - `frontend/src/components/ilc-site-snapshot-chart.ts`: 169 lines.
  - `frontend/src/api/load-control-api.ts`: 511 lines.
  - `custom_components/intelligent_load_controller/websocket_api.py`: 733 lines.
- Screenshot baseline:
  - 24 fixture screenshots under `docs/ux/screenshots/current/`.
  - Captured states: overview, plan, history/current insights, configuration/current settings, load detail/current controls, empty loads.
  - Captured viewports/themes: 1280×800 desktop and 390×844 mobile; light and dark theme variable sets.
- Current capture warnings:
  - Lit dev-mode warnings are expected in local Vite.
  - ECharts emitted zero-dimension and duplicate-instance warnings in fixture captures. This becomes a Phase 1/2 chart lifecycle hardening item.
- External reference research:
  - Home Assistant design/frontend/energy/views/custom-panel docs.
  - Tesla Energy app documentation.
  - SPAN Home App documentation.
  - Amber SmartShift updates.
  - Apple HIG/chart/tab guidance.
  - Material 3 navigation/layout guidance.

## Phase 0 exit-gate assessment

| Gate | Assessment |
| --- | --- |
| Every current page/workflow assessed | Partially satisfied for fixture-visible pages. Live HAOS screenshots/metadata remain future validation evidence. |
| Target page structure documented | Satisfied in `information-architecture.md` and `wireframes.md`. |
| Required backend fields identified | Satisfied in `backend-presentation-gap-analysis.md`. |
| No unresolved navigation/component architecture question remains | Satisfied for Phase 1 direction through ADR-0007/0008. |
| No production behavioural change | Satisfied; source additions are docs/placeholders/screenshots only. |

Phase 0 is suitable for review, but should not be treated as final redesign completion. The actual UI redesign begins in Phase 1.

## Recommended Phase 1 next steps

1. Introduce router/app-shell/navigation/page-header components while preserving current backend access.
2. Move existing pages into separate page components without redesigning every page at once.
3. Add route tests for Overview, Loads, load detail, Plan, Insights, Settings, Diagnostics/missing load.
4. Add design tokens and shared primitives.
5. Add visual-regression screenshot harness and establish baselines after the shell stabilises.
6. Keep the production-bundle no-blank-panel tests green throughout.

