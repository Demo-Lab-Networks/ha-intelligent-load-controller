# ADR-0006: Privacy-safe observability, dependency review, and release evidence

**Status:** Accepted
**Date:** 2026-07-22

## Context

Load-control diagnostics need enough detail to explain faults and decisions, but may reveal household routines, entity names, user identifiers, and location. HACS publication also requires reproducible, licence-aware releases.

## Decision

- Keep runtime local. Do not add a cloud SDK, retailer client, telemetry pipeline, or unrestricted export in V1.
- Diagnostics and downloadable decision reports are bounded, retention-controlled, schema-versioned, and redact tokens, user IDs, personal information, configured-sensitive entity names, and location details. They never contain unlimited history or secrets.
- Expose structured decision, validation, learning, health, repairs, and migration evidence through permissioned Home Assistant interfaces.
- Use locked development/frontend dependencies, retain licence/notice evidence, and review every new runtime/development dependency before merge. Prefer Python stdlib and Home Assistant APIs for runtime policy.
- Release only a versioned, reproducible package after backend/frontend tests, lint/type checks, accessibility, safety-critical branch coverage, deterministic simulations, migration/security/dependency review, HACS, Hassfest, screenshots, and clean-install evidence pass.
- Use semantic versions and a GitHub Release for distribution once repository owner, URLs, code owner, and release permissions are supplied.

## Consequences

Supportability does not require private cloud data. A release may be blocked by missing evidence or external publication credentials even when implementation is complete. Exact thresholds and evidence are maintained in `TEST_PLAN.md` and `ROADMAP.md`.
