# Backend presentation gap analysis

**Status:** Phase 0 contract for optional display-oriented backend fields.  
**Rule:** These fields present backend-authoritative decisions. They must not change planner, safety, actuator, or optimisation semantics.

**2026-07-23 update:** The Phase 2 Overview starter renders a better frontend hierarchy from existing typed backend fields (`health`, `fault`, `target_status`, `manual_override`, controller state, measurements, and reason codes). A first optional V1 backend-ranked `site_summary.attention[]` feed now covers current warnings, manual overrides, persisted runtime actuator faults, and invalid load configurations with backend-owned rank, severity, reason code, affected object, and destination action. `load_list` also exposes measured current power, configured deadline, runtime/energy/SOC/temperature target progress, conservative target status, and structured next planned start/stop action fields where backend evidence exists. This narrows, but does not close, the broader backend presentation gaps below.

## Current backend contract strengths

- Versioned WebSocket namespace exists under `intelligent_load_controller/v1/...`.
- Existing reads cover site summary, load list/detail, plan/timeline, historical summary, event journal, configuration, diagnostics, and learning.
- Existing writes use backend schema validation and optimistic revisions for configuration mutations.
- Reason codes are stable and localised in the frontend.
- Diagnostics and learning are already separated from everyday panels.

## Presentation gaps

| Need | Current limitation | Proposed optional V1 field or endpoint | Notes |
| --- | --- | --- | --- |
| Overview hero | Site summary exposes raw counts/measurements but no display-ready state summary. | `site_summary.presentation.status_level`, `status_title`, `status_summary`, `decision_explanation`, `target_summary`, `freshness`. | Derived by backend/coordinator from current authoritative state. |
| Next action | Current plan has proposals/next action inconsistently available to overview. | `next_action_at`, `next_action_title`, `next_action_reason`, `next_action_load_id`. | Must use existing plan/arbitrator evidence. |
| Tariff context | Tariff is not a display-ready period in current summary. | `tariff_period`, `tariff_period_ends_at`, `tariff_status_level`. | Phase 5+ data; omit when pricing unavailable. |
| Energy flow | Frontend has values but no canonical node/edge model. | `energy_flow_nodes[]`, `energy_flow_edges[]` with IDs, labels, power, quality, direction. | Lets frontend render without inventing source allocation. |
| Attention feed | Warnings were unranked/non-uniform. The Phase 2 starter now exposes backend-ranked warning/override/runtime-fault/invalid-load items but not target-risk, deadline, tariff, or opportunity items. | Extend optional `site_summary.attention[]` with additional backend-owned target/deadline/tariff/opportunity sources. | Severity/rank/action are backend-authoritative. Frontend localises stable codes and may sort by backend `rank`. |
| Load cards | Load summaries now include current power, configured deadline, fault flag, target progress/status, and next planned action when backend evidence exists, but no full type-specific display model yet. | `display_state`, `status_level`, `status_title`, `status_summary`, `target_label`, `attention_rank`, richer `source_breakdown`. | Preserve existing fields for compatibility. Current `progress`/`target_status` values are conservative and optional: missing plan/feedback evidence produces omission or `unknown`, not a fabricated on-track state. |
| Action eligibility | Frontend can show buttons without clear backend eligibility/effect copy. | `action_eligibility`, `action_block_reason`, `boost_presets`, `override_expires_at`, `override_summary`. | Writes still go through existing action endpoints. |
| Load detail | `load_detail` is currently broad JSON without designed sections. | `type_specific_status`, `decision_explanation`, `target_projection`, `schedule_summary`, `source_breakdown`, `learned_estimate`, `recent_meaningful_events`. | Optional shape should be schema-tested. |
| Plan narrative | Plan view lacks concise backend explanation. | `current_plan.narrative`, `warnings[].affected_load_id`, `warnings[].severity`. | No client-generated optimisation story. |
| Timeline | Intervals exist but no canonical visual categories. | `PlanIntervalResponse.kind` with planned/actual/manual/blocked/fixed/free/solar/catch_up plus `source`. | Keep text alternative and old fields. |
| Insights | Historical summaries can be JSON-like. | `historical_summary.cards[]`, `source_breakdown[]`, `target_performance[]`, `activity_feed[]`. | Diagnostics can still expose raw payloads separately. |
| Missing load | Direct load routes need useful missing page. | Stable `not_found` error with `display_title`, `display_summary`, `recovery_actions`. | Avoid blank or silent redirect. |
| Permission denied | Admin-only configuration/diagnostics needs explicit presentation. | Stable `forbidden` error and `required_permission` metadata. | Frontend localises recovery guidance. |

## Attention rank contract

Backend attention ranks should follow this order unless a more severe safety condition applies:

1. Hard fault
2. Hard site limit
3. Impossible target
4. Target at risk
5. Indefinite manual override
6. Stale required data
7. Active timed override
8. Deadline approaching
9. Configuration warning
10. Informational opportunity

Frontend may sort by backend `rank`; it must not reinterpret severity from English text.

## Contract testing requirements

- Add backend schema tests for all optional presentation fields.
- Add WebSocket contract tests proving old clients can ignore new fields.
- Add frontend model tests for missing/partial presentation fields.
- Maintain the current `site_summary.attention[]` contract tests for backend rank/severity/action and frontend fallback compatibility.
- Add permission and stable-error tests for Settings and Diagnostics routes.
- Keep presentation models redacted; no entity secrets or unrestricted state.
