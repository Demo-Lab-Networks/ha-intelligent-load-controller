# Contributing

Thanks for contributing to Intelligent Load Controller. This project controls electrical loads, so safety, reproducibility, and evidence matter more than feature velocity.

## Before you start

1. Read the [product specification](docs/PRODUCT_SPECIFICATION.md), [control model](docs/CONTROL_MODEL.md), [test plan](docs/TEST_PLAN.md), [traceability matrix](docs/TRACEABILITY_MATRIX.md), and [AGENTS.md](AGENTS.md).
2. Work only with simulated or non-production Home Assistant entities/data.
3. Open an issue or discuss substantial architecture/dependency changes before implementation; record material decisions in an ADR.
4. Do not add a cloud service, retailer client, solver, ML planner, or runtime CDN without an accepted ADR and dependency review.

## Change requirements

- Keep pure policy independent of Home Assistant, direct wall-clock calls, I/O, and mutable global state.
- Inject time; preserve DST/restart semantics; preview may never actuate or mutate recovery state.
- The site arbitrator remains the only automatic-action authority. Never weaken hard electrical/equipment limits.
- Add/adjust unit, integration, frontend, simulation, and accessibility tests appropriate to the change.
- Update translations for visible text, stable reason codes for new decisions, diagnostics redaction for new data, and documentation/traceability for changed requirements.
- Preserve migration compatibility. Migrations and startup paths must not switch a physical output.
- Keep commits focused. Do not reformat/delete unrelated code or tests to obtain a pass.

## Pull requests

Use the template. Include linked requirement IDs, test commands/results, safety impact, migration/configuration impact, UI screenshots for visual changes, and any remaining limitation. A PR may not claim a phase/feature complete without the corresponding acceptance evidence.

## Reporting issues

Use the issue templates. Never include secrets, Home Assistant tokens, personal/location data, or production diagnostics without redaction. For security issues, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
