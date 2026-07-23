# ADR-0007: Route-aware panel shell and navigation

**Status:** Accepted for UX redesign Phase 0  
**Date:** 2026-07-23

## Context

The current panel uses internal workspace state and a row of buttons for Dashboard, Plan, History, and Configure. Direct route handling exists only partially. The redesign requires stable top-level destinations:

- Overview
- Loads
- Plan
- Insights
- Settings
- Diagnostics

It also requires direct load routes, browser back/forward support, mobile and desktop navigation using the same route model, and no actions inside navigation controls.

## Decision

Build a route-aware application shell in Phase 1. The root custom element remains small and delegates to:

- an app shell,
- router,
- navigation component,
- page header,
- notification/attention centre,
- routed page components.

The canonical route model is documented in `docs/ux/information-architecture.md`. Desktop/wide tablet may render compact top navigation or an app rail. Narrow/mobile renders stable bottom navigation for the five primary destinations. Diagnostics is administrator/contextual, not a primary mobile tab.

## Consequences

- Existing functionality must remain reachable during migration.
- Direct URLs must refresh correctly once the shell lands.
- Load detail uses breadcrumb/back affordance and renders a missing-load state for deleted/inaccessible load IDs.
- Actions such as Boost, Replan, Save, Delete, Export, and Automatic control stay in page content, not navigation.
- The Home Assistant sidebar remains the app entry point and is not duplicated.

