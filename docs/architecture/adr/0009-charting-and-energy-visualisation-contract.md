# ADR-0009: Charting and energy visualisation contract

**Status:** Accepted for UX redesign Phase 0  
**Date:** 2026-07-23

## Context

The frontend already bundles Apache ECharts locally. The blank-panel defect proved that optional chart code must not block root panel registration. The redesign adds richer visual needs: energy flow, Gantt-like plan timelines, source breakdown, insight charts, and chart textual alternatives.

## Decision

Keep Apache ECharts as the charting dependency for V1 and continue bundling it locally. Use custom Lit/SVG/CSS components where a purpose-built energy flow or timeline is simpler, more accessible, or lower risk than a generic chart.

All chart and timeline features must:

- lazy-load outside the root shell where practical,
- have a visible fallback,
- provide a textual/table alternative,
- use semantic energy/status tokens,
- avoid runtime CDN assets,
- pass production-bundle checks for Node-only globals,
- respect reduced motion.

## Consequences

- ECharts remains licence-reviewed through `docs/DEPENDENCY_REVIEW.md`.
- Plan and insights pages can use ECharts where interaction/scale justifies it.
- Overview energy flow may be a project-owned SVG/CSS component to avoid over-charting simple current state.
- Browser import tests remain authoritative for no-blank-panel protection.

