# ADR-0001: Compatibility floor, HACS packaging, and localisation

**Status:** Accepted
**Date:** 2026-07-22

## Context

V1 needs Home Assistant config subentries so a site config entry can own independently managed loads. The integration is a HACS-distributed custom component with a bundled panel. Custom component translations differ from Home Assistant Core's build-time `strings.json` workflow.

## Decision

- Support Home Assistant Core **2025.4.0 and later** in V1; declare the matching minimum in `hacs.json`.
- Ship one integration only: `custom_components/intelligent_load_controller`. All runtime code and the compiled frontend artifact live under that directory, as required for HACS integration packaging.
- Use HACS as the primary distribution path; do not require a manual Lovelace resource, external CDN, or runtime cloud asset.
- Provide English translations in `custom_components/intelligent_load_controller/translations/en.json`, with complete literal strings. Do **not** add `strings.json`.
- Register static paths asynchronously and add/remove the sidebar panel as part of integration setup/unload. The frontend is a locally committed build artifact.
- Use a standard custom-integration manifest with config flow, hub integration type, calculated IoT class, semantic version, documentation, issue tracker, and code-owner metadata. Repository-specific URLs/owner handles remain placeholders until supplied; they must not be fabricated.

## Consequences

The 2025.4.0 floor excludes older Home Assistant installations but enables the native subentry lifecycle and avoids a private load-config registry. Translation tooling must validate `translations/*.json`; HACS/Hassfest and local panel lifecycle checks are release gates. A later compatibility change requires this ADR and an upgrade/migration assessment.

## Evidence and references

- Home Assistant introduced config subentries in February 2025: <https://developers.home-assistant.io/blog/2025/02/16/config-subentries/>.
- Custom integrations load language files from `translations/` and must not use `strings.json`: <https://developers.home-assistant.io/docs/internationalization/custom_integration/>.
- HACS requires one custom component directory and runtime files inside it: <https://hacs.xyz/docs/publish/integration/>.
- Async static path registration is the required non-blocking API: <https://developers.home-assistant.io/blog/2024/06/18/async_register_static_paths/>.
