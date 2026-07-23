# Phase 1 shell screenshot baseline

**Captured:** 2026-07-23  
**Source:** local Vite harness with simulated Home Assistant data only.  
**Purpose:** visual-regression baseline for the route-aware shell, navigation, viewport fill, light/dark theme variables, and direct-route rendering.

These screenshots are not live HAOS validation evidence and do not prove the redesign is complete. They intentionally show legacy page content inside the new shell so later phases can compare the transition from administrative pages to designed energy-management views.

## Viewport baseline

| Route | Viewports | Themes |
| --- | --- | --- |
| Overview | 320×700, 390×844, 768×1024, 1280×800, 1920×1080 | light, dark |

## Route baseline

| Route | Viewport | Themes |
| --- | --- | --- |
| Overview | 1280×800 | light, dark |
| Loads | 1280×800 | light, dark |
| Load detail `/loads/hot-water` | 1280×800 | light, dark |
| Plan | 1280×800 | light, dark |
| Insights | 1280×800 | light, dark |
| Settings | 1280×800 | light, dark |
| Diagnostics | 1280×800 | light, dark |

## Observations

- The shell, direct routes, selected navigation state, and dark-theme viewport fill render correctly in the fixture harness.
- Mobile uses the same route model and collapses the five primary destinations into a bottom navigation; Diagnostics is hidden at the narrow breakpoint.
- The Overview still contains the legacy equal-weight metric grid and generic load cards. That is deliberately carried forward as Phase 2 work, not accepted polish.
- The chart initialization race that produced duplicate ECharts instance warnings was fixed in the Phase 1 shell slice.
