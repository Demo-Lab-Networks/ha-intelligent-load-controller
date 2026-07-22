# Delivery Roadmap

**Status:** Approved implementation sequence
**Rule:** A phase is not complete merely because code exists. Its listed evidence must be recorded in the traceability matrix and release evidence set.

| Phase | Outcome | Dependencies | Exit evidence |
| --- | --- | --- | --- |
| 0 — Architecture | Product/architecture/UX/test docs, ADRs, traceability, dependency review, prerequisites | Supplied specification | Every requirement, acceptance scenario, quality gate, and phase exit has an ID; official baseline and dependencies recorded; no unresolved architectural blocker |
| 1 — Foundation | Repo tooling, Python 3.13/Node 22 environment, devcontainer, simulated HA, safe scripts, CI, manifest/HACS/translations, reproducible panel artifact, authenticated empty panel | 0 | Clean checkout bootstraps/builds/lints/tests; integration/panel load; CI succeeds |
| 2 — Pure engine | Frozen models, injected clock, schedules/DST/day boundaries, accounting, tariff/cost/solar logic, state/reasons, deadline planner, learning foundation, simulator | 0–1 | No HA imports in policy; safety invariants plus DST/midnight tests pass |
| 3 — HA backend | Site flow/load subentries, schema/revisions, entities/devices/actions, Store/migrations/recovery, panel lifecycle, secured WebSocket, diagnostics/repairs/health | 2 | Add/edit/reload/remove works; no startup switching; permission, Energy, recovery, diagnostics and repair tests pass |
| 4 — HWS and generic binary | Switch/action adapters, manual actuator test, HWS/generic presets, feedback accounting, Automatic/Boost, solar/free/deadline/fault behaviour | 2–3 | HWS scenarios, anti-flapping, disabled-Automatic, override, and restart recovery pass |
| 5 — Cost optimisation | Static/TOU/current/future entity prices, feed-in/free/negative price model, hybrid mode, controlled-cost accounting, non-actuating preview | 2–4 | Tested plans are cost-optimal while guarantees hold; stale/missing price behavior is safe |
| 6 — EV and battery | Binary/variable EV and generic battery adapters; SOC/departure, increments/ramping/qualification, emergency reduction, fallback/faults | 2–5 | SOC/current bound scenarios pass; no rapid oscillation; safe fallback works |
| 7 — Site orchestration | Authoritative arbitrator, limits, phase display, no solar double count, priority/fairness/starvation prevention, staggering/throttling/reasons | 4–6 | Deterministic 20-load simulation respects limits, allocates solar once, and has no permanent starvation |
| 8 — Adaptive estimation | Conservative estimates, valid samples, median/EWMA/bounds/confidence/persistence, reset/freeze/restore UI/API | 4–7 | Cold start, outlier, bounds, restart, and hard-limit-invariance evidence passes |
| 9 — Dashboards | Dynamic central dashboard/cards/graphs/timeline/alerts, per-load routes, histories, responsive/localised/accessibility UX | 1, 3, 7–8 | No manual cards; all loads route; desktop/mobile/theme/keyboard/screen-reader/reconnect tests pass |
| 10 — Mature configuration | Progressive site/load wizards, presets, visual schedule editor, validation/conflicts, preview, CRUD/reconfigure, native parity, Energy guidance | 2–5, 9 | All V1 scenarios configure without YAML; unsafe data is never silently saved; preview never acts |
| 11 — Hardening and release | Fault/performance/full-year simulations, security/dependency/migration review, docs/screenshots, release workflow, HACS/Hassfest/clean install | All previous | All quality gates pass; no known critical/high defect; every acceptance criterion has evidence |

## Cross-phase delivery rules

- Keep `main` buildable; use focused commits/branches and run relevant tests with each behavioral change.
- Preserve the pure-policy/Home Assistant adapter boundary. Inject time into policy and never mutate/actuate during preview.
- Never use production entities or data in tests. Scripts must be rerunnable and never modify production Home Assistant data.
- Update localisation, accessibility, tests, traceability, ADRs, licence review, documentation, migration path, and diagnostics whenever a visible/control behavior changes.
- Do not weaken typing, linting, tests, warnings, or safety constraints to obtain a pass.

## Release milestones

1. **Internal simulated alpha:** Phases 1–4 with full HWS/generic safety evidence only; no public capability claim for EV/battery/multi-load optimisation.
2. **Functional beta:** Phases 5–10 with all V1 load/config/dashboard paths tested against simulated Home Assistant; feature flags may protect incomplete functions.
3. **Release candidate:** Phase 11 evidence package including migrations, fault injection, full-year simulation, screenshots, HACS/Hassfest, accessibility, licence/security review, and clean HACS install.
4. **Public release:** Signed/tagged semantic version and GitHub Release after owner/metadata/permissions/HACS prerequisites in `EXTERNAL_PREREQUISITES.md` are satisfied.

## Deferred roadmap

Future interfaces may support direct Amber/AGL/Origin/OVO APIs; solar/household/export/carbon/market forecasts; demand response and emergency curtailment; intelligent battery SOC planning/dispatch and vendor adapters; full phase-aware optimisation; multi-site/multi-switchboard control; forecast-bias learning; carbon optimisation; V2G; and direct inverter control. None may bypass the V1 safety, arbitration, privacy, or deterministic-fallback principles.
