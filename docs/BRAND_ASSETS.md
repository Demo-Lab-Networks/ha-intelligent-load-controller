# Brand Assets and Verification

## Root cause

The original branding gap was caused by missing local brand paths and a HACS CDN fallback:

- Current HACS validation accepts local brand assets at `brand/icon.png` when `content_in_root` is true, or under the downloaded integration path otherwise.
- Some HACS UI/update surfaces still build integration image URLs from `https://brands.home-assistant.io/_/<domain>/icon.png`.
- The repository only had integration-local files under `custom_components/intelligent_load_controller/brand/`.

That meant:

- HACS package validation had no repository-root local brand asset to validate.
- HACS UI surfaces that still use the Home Assistant brands CDN can continue showing the generic placeholder until the domain is available through the brands CDN or HACS changes that display path.
- Home Assistant versions before 2026.3 could not use the integration-local files either, because local custom-integration branding was added in Home Assistant 2026.3.

The previous asset set also had a quality gap:

- `icon.png` and `logo.png` were byte-identical square PNGs, so the repository did not actually have a distinct landscape logo asset.
- The existing CI workflow ignored root brand assets, so local brand packaging was not validated automatically by this repository's own tests.

## Compatibility findings

| Consumer | Required asset path | Current outcome |
| --- | --- | --- |
| HACS package validation | `brand/icon.png` when `content_in_root` is true | Supported by this repository fix |
| HACS UI surfaces that use the Home Assistant brands CDN | HACS needs to stop using the legacy brands-CDN placeholder path for new custom integrations | Not fixable in this repository; `home-assistant/brands` no longer accepts new custom integration entries |
| Home Assistant 2026.3+ installed custom integration branding | `custom_components/intelligent_load_controller/brand/` | Supported by this repository fix |
| Home Assistant 2025.4.0 through 2026.2.x installed integration branding | Previously central `home-assistant/brands`; now closed to new custom integration entries | Known limitation |

Outcome adopted for this repository:

1. Root branding plus integration-local branding makes the downloaded repository complete and passes current HACS package validation.
2. Home Assistant 2026.3+ can serve the installed custom integration icon from the integration-local `brand/` directory.
3. A central `home-assistant/brands` submission would be required for Home Assistant versions before 2026.3 and for any HACS UI surface that continues to fetch from the brands CDN, but Home Assistant brands now automatically closes new custom integration brand submissions.

The external pull request was opened after maintainer approval, validated successfully, and was then closed by Home Assistant automation because new custom integration brand entries are no longer accepted.

## Canonical asset layout

The root `brand/` directory is the canonical source of truth. These files are committed:

- `brand/icon.png`
- `brand/icon@2x.png`
- `brand/logo.png`
- `brand/logo@2x.png`

Those files are copied verbatim into:

- `custom_components/intelligent_load_controller/brand/`

Do not use symlinks. HACS downloads, GitHub release archives, and Windows development checkouts need real files in both locations.

## Validation and sync tooling

- `scripts/sync-brand-assets`
  Copies canonical root brand assets into the integration-local `brand/` directory and removes stale PNGs there.
- `scripts/validate-brand-assets`
  Validates PNG signatures, non-zero dimensions, square icon rules, alpha preservation, landscape logo shape, non-identical icon/logo content, and byte-for-byte sync between the root and integration copies.
- `tests/test_brand_assets.py`
  Runs the validator in the normal backend pytest suite.

## Operator verification runbook

1. Push or merge the branding fix.
2. In HACS, redownload Intelligent Load Controller from the corrected branch or release.
3. Restart Home Assistant.
4. Confirm these files exist:
   - `/config/custom_components/intelligent_load_controller/brand/icon.png`
   - `/config/custom_components/intelligent_load_controller/brand/logo.png`
5. Refresh HACS repository information. Remove and re-add the custom repository only if normal refresh does not update the cached metadata.
6. Perform a hard browser refresh.
7. Verify the local downloaded assets and current UI behavior:
   - In HACS repository listing and detail pages, note whether the icon appears or whether HACS still serves the brands-CDN placeholder.
   - In `Settings > Devices & services`.
   - In the add-integration search result.
8. While authenticated, verify Home Assistant returns the real PNG rather than a placeholder:
   - `/api/brands/integration/intelligent_load_controller/icon.png?placeholder=no`
9. Inspect browser developer tools for:
   - `404` responses
   - Cached placeholder responses
   - Incorrect MIME types
   - Authentication failures
   - Image decoding errors
10. Record the Home Assistant Core version and HACS version used for verification.

## Cache-clearing notes

If the icon still shows the old placeholder after an update:

- Refresh HACS repository information.
- Redownload the repository in HACS.
- Restart Home Assistant.
- Perform a hard browser refresh.

HACS repository imagery and Home Assistant brand surfaces can continue showing cached placeholders until both the downloaded files and the browser/session caches are refreshed. If a HACS surface is still using `brands.home-assistant.io/_/intelligent_load_controller/icon.png`, the placeholder will remain until a central brands entry exists or HACS supports the local brand path for that surface.

## External prerequisite for older Home Assistant versions

Because this project still advertises Home Assistant 2025.4.0 compatibility, pre-2026.3 installed-integration icon coverage remains limited. The central `home-assistant/brands` path is no longer available for new custom integration domains, so this repository can only provide:

- root `brand/` assets for HACS package validation and downloaded repository content;
- integration-local `custom_components/intelligent_load_controller/brand/` assets for Home Assistant 2026.3+;
- operator guidance for HACS/browser cache refresh and CDN-placeholder diagnosis.

External verification on 2026-07-23:

- `home-assistant/brands/custom_integrations/intelligent_load_controller/` returned `404`, so the central custom-integration brand entry does not exist yet.
- Current HACS `update.py` still returns `https://brands.home-assistant.io/_/{domain}/icon.png` for integration update entity pictures.
- Current HACS `validate/brands.py` accepts a local `brand/icon.png` package asset before falling back to the central brands repository.
- `home-assistant/brands` pull request <https://github.com/home-assistant/brands/pull/10820> was opened, passed the upstream `Images` validation, and was automatically closed with the project policy: new custom integration brand icons are no longer accepted in that repository.

The attempted submission was prepared from the canonical root assets in this repository:

- `brand/icon.png`
- `brand/icon@2x.png`
- `brand/logo.png`
- `brand/logo@2x.png`

Target location in the `home-assistant/brands` pull request:

- `custom_integrations/intelligent_load_controller/icon.png`
- `custom_integrations/intelligent_load_controller/icon@2x.png`
- `custom_integrations/intelligent_load_controller/logo.png`
- `custom_integrations/intelligent_load_controller/logo@2x.png`

Staging commands used from this repository root:

```bash
mkdir -p ../brands/custom_integrations/intelligent_load_controller
cp brand/icon.png ../brands/custom_integrations/intelligent_load_controller/icon.png
cp brand/icon@2x.png ../brands/custom_integrations/intelligent_load_controller/icon@2x.png
cp brand/logo.png ../brands/custom_integrations/intelligent_load_controller/logo.png
cp brand/logo@2x.png ../brands/custom_integrations/intelligent_load_controller/logo@2x.png
```

External pull request result:

- <https://github.com/home-assistant/brands/pull/10820> was closed by Home Assistant automation.

If HACS continues to show a placeholder from the CDN-backed path below after the local assets are installed and caches are refreshed, that behavior needs to be fixed in HACS or Home Assistant brand proxy behavior rather than by adding files to this repository:

- `https://brands.home-assistant.io/_/intelligent_load_controller/icon.png`
