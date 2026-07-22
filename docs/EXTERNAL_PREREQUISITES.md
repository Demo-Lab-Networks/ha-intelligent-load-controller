# External Prerequisites and Phase 0 Findings

**Status:** Phase 0 baseline
**Assessment date:** 2026-07-22

## Findings

The workspace was empty and was not an existing Git repository at Phase 0 inspection. There is therefore no conflicting product identity, architecture, licence, or migration history to preserve. The project identity, Apache-2.0 licence, one-repository model, local-only operation, Home Assistant 2025.4.0 V1 compatibility floor, and HACS distribution are adopted from the supplied specification and recorded in the ADRs.

No production entity, retailer credential, cloud account, or manual Lovelace resource is needed to develop V1. Automated evidence must use a non-production Home Assistant instance and simulated entities.

## Required before implementation phases

| Prerequisite | Needed by | Owner / source | Safe default until supplied |
| --- | --- | --- | --- |
| Non-production Home Assistant test instance compatible with 2025.4.0 | Phase 1 integration/E2E validation | Development environment | Simulated HA entities and fixture configuration only |
| Python 3.13 and Node 22 development runtime | Phase 1 tooling | Developer/CI | Document prerequisite checks; do not install into production HA data |
| Representative simulated actuator/feedback entities | Phases 3–10 | Test harness | Create fake switches/actions/sensors, never call a real home device |
| Repository owner and public repository URL | Manifest/release publication | Repository owner | Keep documentation/issue tracker/code-owner values as explicit placeholders; do not invent URLs/handles |
| Issue tracker URL and maintainer code-owner handle | Manifest/HACS metadata | Repository owner | Block public release metadata finalisation, not architecture work |
| GitHub Actions release permissions/secrets | Phase 11 release | Repository owner | Run local/repository CI validation; do not publish |
| HACS listing authority and brand assets | Public HACS listing | Repository owner/brand process | Validate as a private/custom HACS repository first; do not claim default listing |

## Runtime configuration inputs, not project prerequisites

Users supply site-specific data via UI: entity IDs, action targets, sensor sign convention, tariff/price units, notification targets, electrical ratings, limits/margins, phase assignments, schedule/deadline requirements, actuator feedback, and battery policy. These values must be validated and never embedded in source/tests.

## Release blockers versus non-blockers

The missing repository owner/URL, code-owner handle, issue tracker, release credentials, HACS listing/brand evidence, and a clean non-production HACS installation are **publication blockers**. They are not blockers to Phase 0 documentation, Phase 1 scaffolding, pure engine development, or simulated integration tests. No unresolved product or architectural decision remains from the supplied specification.

## Official-guidance verification record

- Home Assistant config subentries are an official feature appropriate for site-owned load records: <https://developers.home-assistant.io/blog/2025/02/16/config-subentries/>.
- Custom integrations use `translations/<language>.json`; `strings.json` is Core-only: <https://developers.home-assistant.io/docs/internationalization/custom_integration/>.
- Static paths should use `async_register_static_paths`: <https://developers.home-assistant.io/blog/2024/06/18/async_register_static_paths/>.
- HACS integration packaging requires one component directory and the required manifest fields: <https://hacs.xyz/docs/publish/integration/>.

These links were checked in Phase 0 and must be revisited as part of any compatibility-floor or release change.
