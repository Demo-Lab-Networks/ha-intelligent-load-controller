# ADR-0003: Versioned configuration, bounded recovery state, and DST policy

**Status:** Accepted
**Date:** 2026-07-22

## Context

Configuration is editable through multiple UI surfaces, loads must survive migrations and restart, schedules use local time, and timer semantics must not become ambiguous across DST or process loss.

## Decision

- Store site configuration in config-entry options and each load in a `load` config subentry with stable UUID, schema version, and monotonically increasing revision.
- Use one canonical backend schema/validator for config flows, subentry flows, WebSocket operations, preview, diagnostics, and migrations. Require `if_revision` on panel mutations and return `config_conflict` on mismatch.
- Store only bounded recovery state in a versioned Home Assistant Store: operational-day counters, state/holds, absolute-expiry overrides, bounded journal, plan summary, learning, and revision metadata. Recorder/long-term statistics remain historical storage.
- Persist timed overrides as absolute UTC expiry instants. Reconstruct monotonic qualifications/holds conservatively from persisted wall-clock anchors after restart; never credit unobserved elapsed qualification.
- Persist all instants in UTC. Schedules retain site local timezone and wall-clock definitions. On fall-back, resolve starts to the first occurrence and ends to the second; advance nonexistent spring-forward times to the next valid local instant.
- Migrations are explicit, forward-only, idempotent, and must never command a physical output.

## Consequences

Concurrent browser edits fail safely instead of silently overwriting. Recovery is bounded and restart-safe without a second time-series database. DST semantics are predictable and require tests in Brisbane, Sydney, UTC, and a northern-hemisphere zone.
