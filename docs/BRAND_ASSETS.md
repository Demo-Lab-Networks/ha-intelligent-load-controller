# Brand Assets and Verification

## Root cause

The original HACS placeholder was caused by a path mismatch:

- HACS reads repository branding from the repository-root `brand/` directory and expects at least `brand/icon.png`.
- The repository only had integration-local files under `custom_components/intelligent_load_controller/brand/`.

That meant:

- HACS could not find repository branding and showed the generic placeholder.
- Home Assistant versions before 2026.3 could not use the integration-local files either, because local custom-integration branding was added in Home Assistant 2026.3.

The previous asset set also had a quality gap:

- `icon.png` and `logo.png` were byte-identical square PNGs, so the repository did not actually have a distinct landscape logo asset.
- The existing CI workflow ignored the HACS `brands` check, so this path was never validated automatically.

## Compatibility findings

| Consumer | Required asset path | Current outcome |
| --- | --- | --- |
| HACS repository card/detail | `brand/icon.png` and optional related root assets | Supported by this repository fix |
| Home Assistant 2026.3+ installed custom integration branding | `custom_components/intelligent_load_controller/brand/` | Supported by this repository fix |
| Home Assistant 2025.4.0 through 2026.2.x installed integration branding | Central `home-assistant/brands` submission for `custom_integrations/intelligent_load_controller/` | Still an external prerequisite |

Outcome adopted for this repository:

1. Root HACS branding plus integration-local branding solves HACS and Home Assistant 2026.3+.
2. For the advertised compatibility floor older than 2026.3, a central `home-assistant/brands` submission is still required if you want the installed integration icon to appear in the built-in Home Assistant brand surfaces on those older versions.

No external pull request has been created by this repository change.

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
7. Verify the icon appears:
   - In the HACS repository listing.
   - On the HACS repository detail page.
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

HACS repository imagery and Home Assistant brand surfaces can continue showing cached placeholders until both the downloaded files and the browser/session caches are refreshed.

## External prerequisite for older Home Assistant versions

Because this project still advertises Home Assistant 2025.4.0 compatibility, a future submission to `home-assistant/brands` is still needed for pre-2026.3 installed-integration icon coverage.

Prepare that submission from the canonical root assets in this repository:

- `brand/icon.png`
- `brand/icon@2x.png`
- `brand/logo.png`
- `brand/logo@2x.png`
