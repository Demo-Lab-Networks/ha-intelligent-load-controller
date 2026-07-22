# ADR-0004: Backend safety authority, startup stabilisation, and manual precedence

**Status:** Accepted
**Date:** 2026-07-22

## Context

Electrical-load control can create unsafe or expensive outcomes if a browser, stale state, configuration preview, migration, or restart emits uncontrolled actions. Users also need meaningful manual control without bypassing hard limits.

## Decision

- Backend policy and the site arbitrator are authoritative. Adapters isolate all Home Assistant reads/actions; panel calculations are display-only.
- A disabled-Automatic load receives no automatic request/command, schedules/catch-up pause, and its physical output is left unchanged. Monitoring/history/fault detection continue.
- Manual overrides normally outrank cost and ordinary priority but never hard electrical or equipment constraints. Manual actions traverse the same arbitrator and feedback/audit pipeline.
- Timed and indefinite On/Off overrides survive browser loss, integration reload, and Home Assistant restart. Enabling Automatic clears override and replans.
- Startup, reload, migration, preview, diagnostics, and panel loading use read-only/null adapters until configuration, observations, and inputs are validated. They must not blindly switch an output.
- A safely observed active load may be adopted after feedback, hold recovery, and site-limit evaluation; recovery is journalled. Missing inputs never invent solar/free energy or start discretionary automatic operation.
- Fault handling avoids command loops, retains evidence, creates repair/diagnostic surfaces, and requires positive evidence before clearing serious fault state.

## Consequences

Manual operation is useful but cannot override electrical protection. Tests must make these guarantees invariant rather than UI convention. The system may defer operation during stabilisation or input loss, favouring safe observability over speculative behaviour.
