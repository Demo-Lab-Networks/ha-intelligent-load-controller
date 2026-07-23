# UX reference benchmark

**Status:** Phase 0 research synthesis  
**Scope:** Interaction principles for the Intelligent Load Controller redesign.  
**Rule:** This is not permission to copy proprietary artwork, screenshots, icons, animations, colour palettes, or trade dress. The product must remain an original Home Assistant integration.

## Sources reviewed

| Reference | Useful evidence | Principles to adopt | Boundaries |
| --- | --- | --- | --- |
| Home Assistant design portal and frontend design docs | The developer docs point contributors to the Home Assistant design portal for reusable UI components, dashboard card states, light/dark comparison, and wording guidance. | Use Home Assistant terminology, theme variables, dark/light compatibility, familiar entity/control phrasing, and dashboard conventions. Keep the panel native-feeling inside the HA shell. | Do not depend on undocumented private HA frontend components. Prefer local web components styled with HA variables and native controls where stable. |
| Home Assistant Energy dashboard docs | HA Energy uses date/range selection, energy distribution, source tables, grid balance, device energy rankings, and flow/Sankey conventions. | Treat energy data as source/destination flows, keep date range controls consistent, show import/export sign clearly, provide source tables and chart alternatives. | Do not imply the integration edits HA Energy configuration; provide guidance and compatible sensors only. |
| Home Assistant dashboard views | HA views provide named routes, optional icons/title display, URL paths, subviews, and theme-aware layouts. | Route-aware destinations should feel like app views: stable names, icons plus text, direct paths, and clear subview/back behaviour for load detail. | Do not duplicate HA’s sidebar or recreate Lovelace edit affordances inside the panel. |
| Home Assistant custom panels | HA custom panel registration supports a locally served module under `_panel_custom` with custom element name and module URL. | Preserve the local bundled panel and the previously fixed `component_name="custom"` registration contract. | No runtime CDN, no iframe embedding, no switch back to domain-named built-in panels. |
| Tesla Energy app documentation | Tesla explains home energy as components, energy flow, day/month/year/lifetime history, scrubbing, source colours, imports/exports, and export/download paths. | Put “what is happening now?” first; use component drill-down, energy flow, consistent source colours, time-scale selection, scrubbable/history principles, and a simple impact layer. | Do not copy Tesla layouts, colours, app chrome, imagery, or brand language. |
| SPAN Home App | SPAN emphasises whole-home visibility, current top energy users, cost-saving insights, circuit/load control, backup priorities, EV charging windows, and “where solar is going.” | Rank loads by attention/current activity, distinguish monitoring/control/settings/activity, expose “where solar is going”, and provide contextual load controls. | Do not imitate SPAN’s panel/circuit visuals or proprietary device-control patterns. |
| Amber SmartShift updates | Amber describes clearer Live and Plan screens, better contrast, simplified information, Ready-By EV planning, 24-hour timelines, reasons, and self-serve issue diagnosis. | Separate Live from Plan, use high-contrast text, explain planned future operation, expose price/forecast situation, and make “why” accessible from the plan. | Do not copy Amber branding, market claims, or retailer-specific behaviour. |
| Apple Human Interface Guidelines and chart guidance | Apple summarises charts as tools for highlighting a few key pieces of information, communicating complex data efficiently, and supporting decisions. Tab bars navigate top-level app sections. | Keep charts focused, labelled, accessible, and decision-oriented. Use stable top-level navigation on small screens; actions belong in content/toolbars, not navigation. | ILC is not an iOS app; do not import platform-specific visual style as product identity. |
| Material Design 3 layout/navigation guidance | Material 3 describes adaptive layouts and navigation bar/rail patterns for different window sizes; public pages are JavaScript-rendered but official search snippets confirm navigation bar/rail use. | Use bottom navigation for narrow widths and compact top/rail navigation for wider layouts. Consider list-detail/supporting-pane patterns for load catalogue/detail and plan/detail. | Do not add Material as a runtime dependency or make the app look like an Android clone without an ADR. |

## Synthesised product principles

1. **Answer first, data second.** The overview must answer site state, target risk, next action, and reason before it exposes raw metrics.
2. **Live, Plan, Insights, Settings are distinct modes.** Users should never confuse actual current operation with intended future operation or configuration.
3. **Backend-authoritative explanations.** The frontend may improve presentation, but it must not infer safety severity, action eligibility, or optimisation reasons.
4. **One original energy language.** Energy-source colours, icons, labels, data quality, and directionality must mean the same thing across overview, plan, insights, and load pages.
5. **Attention is ranked, not scattered.** Faults, target risk, stale data, indefinite overrides, and opportunities belong in a single backend-ranked feed.
6. **Progressive disclosure beats giant forms.** Everyday operations sit on the overview and load pages; advanced configuration moves into guided sections with review and preview.
7. **Charts are answers, not decoration.** Every chart needs a title, current conclusion, textual alternative, keyboard/screen-reader path, and useful empty state.
8. **Responsive navigation is one route model.** Desktop and mobile can render navigation differently, but direct URLs and back/forward behaviour must be identical.
9. **Native to Home Assistant, not limited by cards.** Use HA theme variables and terminology, but design a coherent product experience rather than a wall of generic HA-card lookalikes.
10. **No optional component can blank the shell.** The root panel must remain small, resilient, and visible while charts/configuration/detail features lazy-load or fail.

## Reference-to-ILC mapping

| ILC area | Adopted principle | Reference driver |
| --- | --- | --- |
| Overview hero | Concise Home Status, next action, “why”, and target confidence. | Tesla Home, Amber Live, Apple clarity |
| Energy flow | Nodes/edges for solar, grid, home/base load, controlled loads, battery; current values and direction. | Tesla Energy Flow, HA Energy Distribution, SPAN solar destination |
| Load catalogue | Sort by attention/current activity, type-aware cards, primary contextual action. | SPAN top users/control, HA view conventions |
| Load detail | Now/Next/Why layout plus type-specific details. | Tesla component drill-down, Amber Ready-By timeline |
| Plan | Visual Gantt workspace with tariff bands, actual/planned/manual/blocked segments, narrative. | Amber Plan, Apple chart guidance |
| Insights | Range selector, source contribution, target completion, meaningful activity feed. | Tesla history/time scales, HA Energy date selector |
| Settings | Progressive sections, inline validation, review, preview; raw data only in Diagnostics. | HA configuration patterns, Amber self-serve troubleshooting |
| Navigation | Five primary destinations, icons and text, bottom nav on mobile, no actions in nav. | HA view paths, Apple tab bars, Material adaptive navigation |

