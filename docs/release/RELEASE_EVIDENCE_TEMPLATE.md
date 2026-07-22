# Release Evidence Template

Copy this file to `docs/release/RELEASE_EVIDENCE.md` only for a candidate that has completed every required gate. Do not create or mark that file approved for development builds.

## Candidate

- Tag: `vX.Y.Z`
- Manifest version: `X.Y.Z`
- Commit: `<full commit SHA>`
- Reviewer(s): `<maintainer handle(s)>`
- Decision date (UTC): `<YYYY-MM-DD>`

## Required evidence

- [ ] Backend lint, formatting, typing, unit/property, integration, migration, repair, and fault-injection evidence attached or linked.
- [ ] Frontend type, unit, Playwright, axe, keyboard, screen-reader, mobile, theme, reconnect, and screenshot evidence attached or linked.
- [ ] Deterministic 20-load and full-year simulation reports attached, including invariant and no-starvation results.
- [ ] Backend coverage is at least 90%, frontend line coverage is at least 85%, and safety-critical branch coverage is complete.
- [ ] HACS, Hassfest, clean HACS installation, manifest/version/changelog, and committed-bundle checks are green.
- [ ] Dependency/SBOM, licence, vulnerability, privacy/redaction, and security reviews are complete with no unaccepted critical/high finding.
- [ ] Migration/recovery, documentation, release notes, external repository metadata, code owner, issue tracker, release permissions, and HACS listing authority are complete.
- [ ] The candidate was tested only with non-production/simulated Home Assistant entities unless separately approved safety evidence is recorded.

## Approval

Replace the next line only after the checked evidence is complete and a named maintainer has approved the candidate:

`Release approval: PENDING`
