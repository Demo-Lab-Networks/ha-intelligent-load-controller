# Implementation Status

**Status:** Development alpha, simulated environments only
**Updated:** 2026-07-23

## Implemented baseline

- Repository/devcontainer/CI foundation for Python 3.13 and Node 22, Apache-2.0 licensing, Home Assistant Core 2025.4.0 compatibility metadata, HACS metadata, English translations, and a locally served committed panel bundle.
- Immutable, Home Assistant-independent control models; deterministic 24-hour/five-minute planner; site arbitrator; tariff, schedule/DST, solar qualification, accounting, learning, and deterministic simulation foundations.
- Home Assistant config entry and `load` config-subentry flows, one canonical validator, revisions/conflict errors, bounded Store recovery, observation-first lifecycle, adapters, entities, actions, diagnostics, repairs, system health, migrations, and authenticated versioned WebSocket API. Cross-load actuator ownership is guarded, and legacy collisions fail closed.
- Local Lit/Vite/ECharts panel with typed WebSocket client, route-aware shell foundation, site/load routing, plans/timelines/history/configuration/override controls, scoped live updates, revision handling, responsive layout, and native `Intl` formatting.
- UX Phase 1 shell work has extracted route-level Overview, Loads, load detail, Plan, Insights, Settings, and Diagnostics presentation modules plus shared load-summary and plan-table components; backend/API orchestration and shared route state remain in the root panel during migration.
- UX Phase 2 Overview starter work has replaced the equal-weight metric wall with a Home Status hero, energy-flow summary, backend-ranked attention feed for warnings/manual overrides/runtime actuator faults/invalid load configuration, focused Today KPIs, compressed Today timeline, grouped active/upcoming loads, and contextual/type-aware load summary cards with deterministic presentation helpers.
- The Loads page now adds local read-only catalogue search, status/type filtering, needs/active/deadline/priority/power/name sorting, and status/type/area/priority grouping over backend load summaries.
- Vitest component/API tests plus Playwright + axe browser accessibility smoke tests using a simulated Home Assistant facade.

## Latest local verification

| Check | Result |
| --- | --- |
| Targeted backend syntax for current UX slice | `python3 -m py_compile custom_components/intelligent_load_controller/coordinator.py tests/integration/test_coordinator.py tests/websocket/test_websocket_api.py` passed |
| Python 3.13 + Home Assistant Core 2025.4.0 backend harness | Targeted `scripts/test-backend tests/integration/test_coordinator.py tests/websocket/test_websocket_api.py -q` is blocked in the current shell because no Python 3.13 interpreter is available; the previous isolated Python 3.13 baseline remains Ruff/MyPy clean with `pytest -q` **46 passed** before this slice |
| Frontend | TypeScript check clean; Vitest **34 passed** across 6 files; committed local bundle rebuilt and bundle validator passed at 1,690,073 bytes |
| Browser accessibility and production-bundle smoke tests | Playwright + axe/production bundle **4 passed** |
| UX Phase 1 shell evidence | 22 local fixture screenshots captured for shell routes, light/dark themes, and required overview viewport sizes |
| Pure control engine | Five deterministic default simulation reports passed, including fail-closed input outage and 20-load arbitration |

The previous full backend checks were run in an isolated Python 3.13 container with Home Assistant Core 2025.4.0. The current shell does not expose Python 3.13, so the current backend attention-slice harness tests are recorded as blocked after syntax compilation. Browser and frontend checks use the repository's locked frontend dependencies; the latest frontend checks were run under Node 22.23.0. All automated evidence uses simulated entities only.

## Not a release assertion

The following release gates remain deliberately open:

- The repository owner/URL, issue tracker, real code owner, release permissions, and HACS listing authority have not been supplied. Manifest publication fields remain explicit placeholders and the release preflight stops before publishing.
- Coverage thresholds, full accessibility matrix, clean HACS installation, Hassfest/HACS CI evidence, full-year release simulation package, screenshots, migration/fault-injection evidence, and final security/licence review remain release work. The preflight also requires a reviewed `docs/release/RELEASE_EVIDENCE.md` based on the committed template before it can publish.
- No real electrical equipment, retailer credentials, cloud services, or production Home Assistant configuration has been used or approved for testing.

Consult [the roadmap](ROADMAP.md), [test plan](TEST_PLAN.md), [traceability matrix](TRACEABILITY_MATRIX.md), and [external prerequisites](EXTERNAL_PREREQUISITES.md) before claiming a delivery phase or public release is complete.
