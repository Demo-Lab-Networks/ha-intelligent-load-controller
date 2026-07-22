# Security Policy

## Supported versions

There is no released version yet. Security fixes will be supported for the latest published release once releases begin.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could expose Home Assistant credentials/data, bypass permissions, trigger unsafe load operation, weaken hard limits, or leak diagnostics.

Until a private repository contact is published, report privately to the repository owner through the hosting platform. Include a minimal reproduction, affected version/commit, impact, and safe proof. Do not include secrets, production entity IDs, or live-control instructions.

Maintainers will acknowledge reports, assess severity, work on a fix, and coordinate disclosure where possible. Public disclosure may be delayed while a safe fix is prepared.

## Security design commitments

- Local-only runtime; no required cloud/retailer credential path in V1.
- Authenticated, permissioned WebSocket/API mutation paths; admin is required for configuration writes.
- No blind actuation during startup, reload, migration, preview, diagnostics, or panel loading.
- Hard equipment/electrical limits remain effective for manual operation.
- Diagnostics are bounded and redact secrets and configured sensitive data.
- Dependencies and licences are reviewed before release.
