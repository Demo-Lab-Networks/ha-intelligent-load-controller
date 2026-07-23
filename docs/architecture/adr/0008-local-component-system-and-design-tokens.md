# ADR-0008: Local component system and design tokens

**Status:** Accepted for UX redesign Phase 0  
**Date:** 2026-07-23

## Context

The current frontend is concentrated in one large Lit component. The redesign requires a coherent visual system, reusable page/layout/status/control components, responsive behaviour, light/dark support, and avoidance of private Home Assistant frontend internals.

Home Assistant frontend guidance points contributors to its public design portal, but undocumented built-in web components can change outside this integration’s control.

## Decision

Use locally bundled Lit web components styled with Home Assistant theme variables and project-owned design tokens. Do not introduce a large UI framework for Phase 1. Standards-based native controls remain acceptable where they provide accessibility and stability.

Phase 1 should introduce source structure under:

- `frontend/src/app/`
- `frontend/src/pages/`
- `frontend/src/components/`
- `frontend/src/features/`
- `frontend/src/state/`
- `frontend/src/design/`
- `frontend/src/styles/`

The design-system contract is documented in `docs/ux/design-system.md`.

## Consequences

- The app remains locally bundled for HACS and works without runtime CDNs.
- The interface can feel native in Home Assistant by using HA theme variables without coupling to private HA components.
- Component primitives become testable in isolation.
- Any future UI dependency must receive an ADR and bundle/licence review before adoption.

