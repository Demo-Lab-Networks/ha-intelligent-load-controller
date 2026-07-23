"""Brand asset regression checks."""

from __future__ import annotations

from pathlib import Path
import sys
from subprocess import run


def test_brand_asset_validator_passes() -> None:
    """The committed canonical and integration brand assets stay in sync."""

    root = Path(__file__).resolve().parent.parent
    result = run(
        [sys.executable, str(root / "scripts" / "brand_assets.py"), "validate"],
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr or result.stdout
