# Dependency and Licence Review

**Status:** Pre-release dependency review; direct frontend inventory recorded
against the committed lockfile. This is not a public-release licence or
security sign-off.
**Current inventory review:** 2026-07-22
**Review cadence:** on every lockfile/dependency change and before every release.

## Decision summary

V1 is deliberately local-first. Runtime policy uses Home Assistant APIs and the Python standard library where practical. It has no cloud SDK, direct retailer client, forecast client, optimiser/solver, telemetry SDK, or runtime CDN. The browser bundle is configured for a reproducible locked build and is committed under the integration directory; a clean-build equivalence artifact remains a release requirement.

## Approved dependency envelope

| Area | Selected / permitted | Licence expectation | Rationale and controls |
| --- | --- | --- | --- |
| Home Assistant runtime | Supported Home Assistant Core APIs | Home Assistant project licence; verify current compatibility | Required host platform. Pin the declared minimum to 2025.4.0 and test API use against it. |
| Core policy | Python standard library first | PSF-compatible | Keeps controller portable and avoids installation burden. Any exception needs ADR + security/licence review. |
| Panel components | Lit 3.3.3 (locked direct dependency) | BSD-3-Clause (direct record complete) | Small reactive component layer; locally bundled. |
| Panel charts | Apache ECharts 6.1.0 (locked direct dependency) | Apache-2.0 (direct record complete) | Needed for graph/timeline; locally bundled; selected in ADR-0005. |
| Panel build | Vite 8.1.5, TypeScript 7.0.2 (locked direct dependencies) | MIT / Apache-2.0 (direct record complete) | Reproducible strict build; lock exact versions. |
| Backend tests | pytest, Hypothesis, Home Assistant test harness | MIT / MPL-2.0 / project licences (verify) | Unit, property, and integration evidence; development-only. |
| Frontend tests | Vitest 4.1.10, Playwright 1.61.1, axe tooling 4.12.1 (locked direct dependencies) | MIT / Apache-2.0 / MPL-2.0 (direct record complete) | Component, E2E, and accessibility evidence; development-only. |
| Quality tooling | Ruff, MyPy | MIT (verify) | Required lint/type gates; development-only. |

The table describes the approved dependency envelope. Exact direct frontend
versions are now recorded in `frontend/package.json` and resolved in the
committed `frontend/package-lock.json` (lockfile version 3). Their direct
notice inventory, source archives, and declared licence identifiers are in
[`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md).

This is deliberately a partial review: the npm lockfile binds its transitive
graph, but a complete transitive licence/SBOM report has not yet been generated
or reviewed. `pyproject.toml` uses exact pins for named Python development
tools, but no Python resolver lockfile or equivalent complete inventory is
committed. Both remain release evidence requirements.

## Current lockfile and review boundary

- `frontend/package-lock.json` is the committed npm resolution source. It pins
  direct and transitive frontend/development packages with registry archive
  URLs and integrity hashes; `npm ci` is the expected clean installation path.
- The seven direct frontend packages used for the panel/build/test surface have
  a recorded version, declared SPDX licence, upstream source, and locked npm
  archive in `THIRD_PARTY_NOTICES.md`: Lit 3.3.3, Apache ECharts 6.1.0, Vite
  8.1.5, TypeScript 7.0.2, Vitest 4.1.10, `@playwright/test` 1.61.1, and
  `@axe-core/playwright` 4.12.1.
- This record confirms the project has no configured runtime CDN dependency and
  that ECharts is Apache-2.0, consistent with ADR-0005. It does **not** approve
  every transitive dependency, validate vulnerability status, replace required
  licence texts, or establish reproducibility/clean-install evidence.
- The Python runtime policy still has no declared third-party runtime
  dependency; Home Assistant and the Python developer/test tools must be
  included in the final resolver inventory and review.

## Explicit exclusions

- No direct Amber, AGL, Origin, OVO, or other retailer API/client in V1.
- No cloud-hosted price, solar, demand, or carbon forecast dependency in V1. Compatible Home Assistant entities/events/calendars are inputs only.
- No mathematical solver in V1. A future solver needs local execution, an acceptable licence, low packaging burden, deterministic fallback, and proof that failure cannot prevent safe control.
- No ML planner. Deterministic bounded learning may adjust estimates only.
- No remote analytics, telemetry, advertising, or runtime CDN.
- No second time-series database; Home Assistant Recorder/statistics remain historical storage.
- No vendor-specific battery/inverter adapter, direct dispatch, or V2G in V1.

## Supply-chain controls

1. Keep direct and transitive frontend/dev dependencies pinned with lockfiles;
   do not accept floating production builds. The npm lockfile exists; add an
   equivalent Python resolver lock or documented reproducible resolver output
   before release.
2. Add a dependency manifest/report generation step to CI and retain notices required by each licence.
3. Review package activity, vulnerability advisories, provenance, maintainers, licence compatibility, and bundle size before adoption.
4. Ban postinstall scripts or generated runtime downloads unless explicitly reviewed and documented.
5. Build the panel in CI and verify the committed distribution matches the locked source build.
6. Run dependency/security audit tools appropriate to the Python/Node lockfiles in release checks; triage rather than suppress findings.
7. Never put access tokens, production entity exports, customer configurations, or household telemetry into fixtures, screenshots, diagnostics, release artifacts, or CI logs.

## Licence posture

The repository is Apache-2.0. Apache-2.0-compatible dependencies are preferred. Permissive licences such as MIT/BSD are expected to be compatible but the exact package/version and notice obligation must be checked. Copyleft or source-available terms require an explicit legal/maintainer decision before use. Do not copy code from competing projects; use public documentation and clean-room implementations.

## HACS and Home Assistant packaging checks

Current HACS guidance requires one integration component directory and says runtime files must live inside it; the compiled panel therefore belongs under `custom_components/intelligent_load_controller/frontend/dist/`. The HACS manifest needs domain, documentation, issue tracker, code owners, name, and version. Current custom-integration localisation guidance says `translations/en.json` is required and `strings.json` must not be used. These are verified in ADR-0001 and must be rechecked during release.

## Open items before a public release

| Item | Owner | Completion evidence |
| --- | --- | --- |
| Direct frontend package inventory and npm lockfile | Maintainer | **Recorded (pre-release):** `frontend/package-lock.json` plus `THIRD_PARTY_NOTICES.md`; transitive review still open |
| Python resolver inventory/lockfile and complete SBOM | Maintainer | Committed reproducible resolver output plus generated full dependency report |
| Licence/notice check for every direct/transitive package | Maintainer | Reviewed report and third-party notices where necessary; direct frontend record alone is insufficient |
| HACS brand asset/public-listing requirements | Maintainer | Validated asset submission or documented listing path |
| Vulnerability review | Maintainer | Release-check output and recorded remediation/accepted risk |
| Reproducible frontend artifact | CI | Clean build equals committed distribution |
| Publication credentials | Repository owner | Protected release workflow succeeds without secret leakage |
