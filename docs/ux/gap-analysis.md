# Phase 0 UX gap analysis

**Compared against:** `docs/FRONTEND_UX_SPECIFICATION.md` and the redesign goal dated 2026-07-23.  
**Implementation rule:** Do not move authoritative safety or optimisation logic into TypeScript. Missing decisions become backend presentation gaps.

## Summary

The current frontend is functional alpha software. It proves panel loading, typed WebSocket access, basic responsive rendering, configuration mutation, plan/history access, and override actions. It does not yet meet the target of a mature energy-management product because its information hierarchy is metric-first, its navigation is workspace-state-based rather than route-first, and its backend contract exposes operational facts without enough presentation structure for “Now, Next, Why”.

## Major gaps

| Spec area | Current evidence | Gap | Phase |
| --- | --- | --- | --- |
| Route-aware IA | Four button workspace plus partial route parsing. | Required destinations are Overview, Loads, Plan, Insights, Settings, Diagnostics, plus direct load URLs that survive refresh/back/forward. | 1 |
| Component architecture | 2,494-line root panel and one chart component. | Need app shell, router, navigation, page components, load components, chart/layout/status/control components, state modules, and lazy-loaded heavy features. | 1 |
| Design system | CSS lives mostly in the root component. | Need semantic tokens for spacing, typography, surfaces, radius, status, energy source, load type, data quality, timeline states, and responsive behaviour. | 1 |
| Overview | Equal metric cards + generic chart + load list. | Need Home Status hero, live energy flow, attention/opportunities, reduced KPI set, grouped active/upcoming loads, and compressed timeline. | 2 |
| Load catalogue | No dedicated Loads page. | Need search/sort/filter/grouping and type-aware cards with contextual action. | 2 |
| Load detail | Generic load control layout. | Need common shell plus HWS/EV/battery/generic details, Now/Next/Why, target projection, source split, cost, learning, events. | 3 |
| Boost | Generic duration input and buttons. | Need quick presets, clear expiry/effect, consequences, pending/confirmed feedback, extend/cancel, persistent indefinite warning. | 3 |
| Plan | Table-first plan/timeline. | Need visual timeline workspace, tariff/free/solar bands, actual vs planned, current time/deadlines, narrative, accessible table alternative. | 4 |
| Insights | History tables and raw-ish summaries. | Need range controls, designed energy/cost/runtime/source/target summaries, activity feed, no raw JSON in ordinary views. | 4 |
| Settings | Basic generated forms. | Need guided site sections, load wizard, validation, review, preview, conflict handling, schedule editor. | 5 |
| Accessibility | Smoke axe tests only. | Need route, keyboard, screen-reader, touch, chart alternative, high-contrast, long text/name, state-specific test coverage. | 1–6 |
| Performance | Chart lazy-loading exists; root panel still carries all page code. | Need page/feature lazy loading and no configuration payload/code for everyday visits where practical. | 1–6 |

## Non-negotiable constraints preserved

- Backend remains authoritative for safety, severity, action eligibility, and optimisation explanations.
- No planner/safety/actuator changes are required for Phase 0.
- The `component_name="custom"` sidebar registration fix remains in place.
- Runtime CDN dependencies remain forbidden.
- Raw diagnostic payloads may exist only in a clearly labelled Diagnostics/developer area.

## Phase 0 decision outcomes

1. Keep Lit/Vite/ECharts for V1; no new UI framework is justified for Phase 1.
2. Build a local ILC design system with HA theme-variable mapping instead of depending on private HA components.
3. Introduce route-aware shell before redesigning page content.
4. Add backend presentation fields as optional V1 additions where they are display-only and do not change control semantics.
5. Treat screenshots captured in this phase as current-state evidence only, not visual-regression baselines for the redesigned UI.

