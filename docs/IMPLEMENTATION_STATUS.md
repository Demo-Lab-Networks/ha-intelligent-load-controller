# Implementation Status

**Status:** Development alpha, simulated environments only
**Updated:** 2026-07-23

## Implemented baseline

- Repository/devcontainer/CI foundation for Python 3.13 and Node 22, Apache-2.0 licensing, Home Assistant Core 2025.4.0 compatibility metadata, HACS metadata, English translations, and a locally served committed panel bundle.
- Immutable, Home Assistant-independent control models; deterministic 24-hour/five-minute planner; site arbitrator; tariff, schedule/DST, solar qualification, accounting, learning, and deterministic simulation foundations.
- Home Assistant config entry and `load` config-subentry flows, one canonical validator, revisions/conflict errors, bounded Store recovery, observation-first lifecycle, adapters, entities, actions, diagnostics, repairs, system health, migrations, and authenticated versioned WebSocket API. Cross-load actuator ownership is guarded, and legacy collisions fail closed.
- Local Lit/Vite/ECharts panel with typed WebSocket client, route-aware shell foundation, site/load routing, plans/timelines/history/configuration/override controls, scoped live updates, revision handling, responsive layout, and native `Intl` formatting.
- UX Phase 1 shell work has extracted route-level Overview, Loads, Plan, Insights, and Diagnostics presentation modules plus shared load-summary and plan-table components; Settings/load-control mutation flows remain in the root panel during migration.
- Vitest component/API tests plus Playwright + axe browser accessibility smoke tests using a simulated Home Assistant facade.

## Latest local verification

| Check | Result |
| --- | --- |
| Python 3.13 + Home Assistant Core 2025.4.0 backend quality | Ruff format/check clean; MyPy clean; `pytest -q` **46 passed** |
| Frontend | TypeScript check clean; Vitest **17 passed**; committed local bundle rebuilt and bundle validator passed at 1,612,025 bytes |
| Browser accessibility and production-bundle smoke tests | Playwright + axe/production bundle **4 passed** |
| UX Phase 1 shell evidence | 22 local fixture screenshots captured for shell routes, light/dark themes, and required overview viewport sizes |
| Pure control engine | Five deterministic default simulation reports passed, including fail-closed input outage and 20-load arbitration |

The backend checks were run in an isolated Python 3.13 container with Home Assistant Core 2025.4.0. Browser and frontend checks use the repository's locked frontend dependencies; the latest frontend checks were run under Node 22.23.0. All automated evidence uses simulated entities only.

## Not a release assertion

The following release gates remain deliberately open:

- The repository owner/URL, issue tracker, real code owner, release permissions, and HACS listing authority have not been supplied. Manifest publication fields remain explicit placeholders and the release preflight stops before publishing.
- Coverage thresholds, full accessibility matrix, clean HACS installation, Hassfest/HACS CI evidence, full-year release simulation package, screenshots, migration/fault-injection evidence, and final security/licence review remain release work. The preflight also requires a reviewed `docs/release/RELEASE_EVIDENCE.md` based on the committed template before it can publish.
- No real electrical equipment, retailer credentials, cloud services, or production Home Assistant configuration has been used or approved for testing.

Consult [the roadmap](ROADMAP.md), [test plan](TEST_PLAN.md), [traceability matrix](TRACEABILITY_MATRIX.md), and [external prerequisites](EXTERNAL_PREREQUISITES.md) before claiming a delivery phase or public release is complete.
