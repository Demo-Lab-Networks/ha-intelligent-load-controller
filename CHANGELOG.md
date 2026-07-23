# Changelog

All notable changes will be documented here. The project intends to follow [Keep a Changelog](https://keepachangelog.com/) and Semantic Versioning once releases begin.

## [Unreleased]

### Added

- No entries yet.

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
