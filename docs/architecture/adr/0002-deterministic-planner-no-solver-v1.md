# ADR-0002: Deterministic five-minute planner; no solver dependency in V1

**Status:** Accepted
**Date:** 2026-07-22

## Context

The controller must coordinate deadlines, tariffs, solar, manual requests, limits, fairness, anti-flapping, and variable current while remaining explainable, local, reliable under dependency failure, and testable by deterministic simulation.

## Decision

- Implement a pure, deterministic 24-hour rolling planner with five-minute plan slots and event-driven real-time control.
- Pass only immutable normalized inputs and injected time into policy; return plan intervals, allocation requests, warnings, quality/confidence, shortfall, and stable reasons.
- Use fixed lexicographic objectives: hard electrical safety; hard equipment safety; mandatory schedules; guaranteed completion; marginal cost; fewer switches; solar self-consumption tie-break; priority/fairness.
- Do not use a machine-learning planner or an optimisation solver in V1. Learning may refine bounded estimates only.
- The site arbitrator, not the planner or an individual load, authorises final automatic commands and rechecks real-time constraints.
- A future solver is permitted only when local, acceptably licensed, low-burden, backed by a deterministic fallback, and irrelevant to safe failure behaviour.

## Consequences

V1 remains explainable and reproducible, with easy property and full-year simulation tests. Some globally optimal corner cases may be deferred, but never at the cost of safety/guarantees. The policy package is portable and testable outside Home Assistant.
