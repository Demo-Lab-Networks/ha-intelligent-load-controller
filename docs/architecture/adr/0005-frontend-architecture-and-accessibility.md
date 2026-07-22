# ADR-0005: Local Lit panel, ECharts, and accessibility-first UX

**Status:** Accepted
**Date:** 2026-07-22

## Context

The product requires a full-screen dynamic dashboard, schedules, graphs, timelines, configuration, and accessible operation without manual Lovelace resources or external assets.

## Decision

- Build the panel with strict TypeScript, Lit, Vite, native `Intl`, and Apache ECharts.
- Bundle and commit the frontend distribution inside the integration; fetch no runtime CDN resource.
- Use versioned authenticated WebSocket commands and server-returned models/reasons. Browser state is a cache/draft, never a control authority.
- Implement responsive desktop/tablet/mobile layouts, Home Assistant theme variables, keyboard/focus support, screen-reader labels, reduced motion, 44 px practical targets, text/icon status indicators, loading/empty/error/reconnect states, confirmation dialogs, and unsaved-change protection.
- Provide table/text equivalents for critical graph and timeline data. Use localisation catalogues and `Intl` for strings/date/time/currency/units; localise stable reason codes rather than parse messages.

## Consequences

ECharts supports the required interactive multi-series graph and Gantt-style timeline while Apache-2.0 aligns with the project licence. It must be version-pinned, reviewed in the dependency inventory, locally tested, and included in third-party notices as applicable. Axe/Playwright evidence is a release gate.
