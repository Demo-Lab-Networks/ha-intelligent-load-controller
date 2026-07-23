# Changelog

All notable changes will be documented here. The project intends to follow [Keep a Changelog](https://keepachangelog.com/) and Semantic Versioning once releases begin.

## [Unreleased]

### Added

- Canonical root `brand/` assets for HACS package validation plus synced integration-local brand assets for Home Assistant 2026.3+.
- Deterministic brand sync/validation tooling, CI brand checking, and troubleshooting/runbook documentation for icon cache refresh, CDN-backed HACS surfaces, and pre-2026.3 branding limits.
- UX redesign Phase 1 shell slice: route-aware Overview/Loads/load-detail/Plan/Insights/Settings/Diagnostics navigation, design tokens, shell/router/feedback/status primitives, and local visual baseline screenshots.
- Read-only frontend diagnostics route and API facade convenience method.
- Route-level page modules for Overview, Loads, load detail, Plan, Insights, Settings, and Diagnostics, plus shared load summary and plan table/proposal components.
- UX redesign Phase 2 Overview starter slice: Home Status hero, live energy-flow summary, attention list, focused Today KPIs, grouped active/upcoming loads, and deterministic overview presentation helpers.
- Optional V1 `site_summary.attention[]` backend presentation field for backend-ranked warning and manual-override attention items.
- Compressed Overview Today timeline component backed by the existing read-only `daily_timeline` WebSocket command.
- Deterministic load-card presentation helper with type-aware HWS, EV, battery, and generic load vocabulary.
- Deterministic load-catalogue presentation helper with local search, status/type filters, sort modes, and status/type/area/priority grouping.
- Backend-ranked attention items for persisted runtime actuator faults and invalid load configurations.
- Backend-owned load-card summary fields for measured current power, configured deadline, and structured next planned start/stop action.
- Backend-owned load-card target progress and target status fields derived from bounded runtime/feedback evidence and stored plan risk.
- Backend-ranked attention items for impossible targets, at-risk targets, and approaching load deadlines.

### Changed

- Rebuilt the committed frontend bundle for the Phase 1 shell slice.
- Local Playwright harness now feeds direct panel paths into the custom panel route property for route testing.
- Reduced the root panel component by moving presentational page rendering, including Settings and load-detail controls, into dedicated modules.
- Replaced the Overview equal-weight metric wall with a stronger everyday-operation hierarchy and more contextual load summary cards.
- Overview attention now prefers backend-owned rank/severity/action data when available while preserving typed-field fallback behaviour for older summaries.
- Plan route data loading now distinguishes the full current plan from the lightweight Overview timeline preload.
- Load summary cards now emphasise priority metrics, target/override/automatic badges, backend reason codes, and contextual non-actuating primary actions.
- Loads page now renders searchable, sortable, filterable grouped catalogue controls over read-only backend load summaries.
- Load summaries now expose a read-only `fault` flag when persisted runtime fault evidence exists.
- Load summary cards now prefer structured next-action time/kind/reason fields and keep the legacy raw `next_action` fallback.

### Fixed

- Guarded Apache ECharts initialization so repeated renders do not create duplicate chart instances.
- Ensured dark-theme shell backgrounds fill the viewport on short pages.
- Replaced raw JSON rendering for ordinary Insights daily summaries with labelled fields and a Diagnostics fallback for complex values.
- Preserved optional site summary measurements in the frontend API facade so grid, solar, cost, energy, and deadline values render when the backend provides them.

## [0.2.0] - Initial 0.2 baseline

### Added

- Phase 0 product, architecture, UX, test, traceability, dependency, prerequisite, and roadmap documentation.
- Six accepted architecture decisions covering compatibility, planning, persistence/DST, safety, frontend, and release/privacy policy.
- Python 3.13/Node 22 development tooling, simulated Home Assistant configuration, CI, HACS/manifest metadata, translations, and a committed local panel bundle.
- Deterministic controller engine, simulator, Home Assistant config/subentry flows, adapters, recovery, entities, actions, diagnostics, repairs, migrations, and versioned WebSocket API.
- Lit/ECharts panel with typed configuration, plan, history, override, and accessibility-test paths.
- Revision-protected configuration mutations, scoped live panel updates, config-subentry entity ownership, and safe duplicated-load drafts.
- Tag-gated release workflow and an evidence-template gate that intentionally blocks publication until all release evidence is reviewed.

### Security

- Observation-first startup, non-actuating previews, hard-limit arbitration, feedback confirmation, duplicate-actuator fail-closed behaviour, sanitized decision reports, redacted diagnostics, and stale-input/price fail-closed behaviour.

### Release status

This is not a public HACS release and is not approved for live electrical control. Publication remains blocked on the external prerequisites and release gates documented in `docs/EXTERNAL_PREREQUISITES.md` and `docs/IMPLEMENTATION_STATUS.md`.
