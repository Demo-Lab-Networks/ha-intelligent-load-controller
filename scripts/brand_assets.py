#!/usr/bin/env python3
"""Deterministic sync and validation helpers for repository brand assets."""

from __future__ import annotations

import argparse
import hashlib
import shutil
import struct
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Final

PNG_SIGNATURE: Final = b"\x89PNG\r\n\x1a\n"
IHDR_COLOR_TYPE_ALPHA: Final = {4, 6}
ROOT = Path(__file__).resolve().parent.parent
CANONICAL_BRAND_DIR = ROOT / "brand"
INTEGRATION_BRAND_DIR = ROOT / "custom_components" / "intelligent_load_controller" / "brand"
REQUIRED_CANONICAL = ("icon.png", "logo.png")


@dataclass(frozen=True)
class PngInfo:
    path: Path
    width: int
    height: int
    color_type: int
    size_bytes: int
    sha256: str

    @property
    def has_alpha(self) -> bool:
        return self.color_type in IHDR_COLOR_TYPE_ALPHA


def _read_png_info(path: Path) -> PngInfo:
    data = path.read_bytes()
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError(f"{path} is not a PNG file.")
    if len(data) < 29:
        raise ValueError(f"{path} is too small to contain a complete IHDR chunk.")
    width, height = struct.unpack(">II", data[16:24])
    color_type = data[25]
    if width <= 0 or height <= 0:
        raise ValueError(f"{path} has invalid PNG dimensions: {width}x{height}.")
    return PngInfo(
        path=path,
        width=width,
        height=height,
        color_type=color_type,
        size_bytes=len(data),
        sha256=hashlib.sha256(data).hexdigest(),
    )


def canonical_brand_files() -> list[Path]:
    files = sorted(path for path in CANONICAL_BRAND_DIR.glob("*.png") if path.is_file())
    if not files:
        raise ValueError("No canonical brand PNGs were found in the root brand directory.")
    return files


def sync_assets() -> list[Path]:
    files = canonical_brand_files()
    INTEGRATION_BRAND_DIR.mkdir(parents=True, exist_ok=True)

    expected_names = {path.name for path in files}
    for existing in INTEGRATION_BRAND_DIR.glob("*.png"):
        if existing.name not in expected_names:
            existing.unlink()

    copied: list[Path] = []
    for source in files:
        destination = INTEGRATION_BRAND_DIR / source.name
        shutil.copy2(source, destination)
        copied.append(destination)
    return copied


def validate_assets() -> list[str]:
    errors: list[str] = []
    canonical_files = canonical_brand_files()
    canonical_map = {path.name: _read_png_info(path) for path in canonical_files}

    for required in REQUIRED_CANONICAL:
        if required not in canonical_map:
            errors.append(f"Missing required canonical brand asset: brand/{required}")

    icon = canonical_map.get("icon.png")
    logo = canonical_map.get("logo.png")
    if icon is not None:
        if icon.width != icon.height:
            errors.append(
                f"brand/icon.png must be square, found {icon.width}x{icon.height}."
            )
        if icon.width < 64 or icon.height < 64:
            errors.append(
                f"brand/icon.png dimensions are unreasonably small: {icon.width}x{icon.height}."
            )
        if not icon.has_alpha:
            errors.append("brand/icon.png should retain transparency/alpha.")
    if logo is not None:
        if logo.width <= logo.height:
            errors.append(
                f"brand/logo.png should be landscape, found {logo.width}x{logo.height}."
            )
        if not logo.has_alpha:
            errors.append("brand/logo.png should retain transparency/alpha.")
    if icon is not None and logo is not None and icon.sha256 == logo.sha256:
        errors.append("brand/icon.png and brand/logo.png must not be byte-identical.")

    destination_files = sorted(
        path for path in INTEGRATION_BRAND_DIR.glob("*.png") if path.is_file()
    )
    destination_names = {path.name for path in destination_files}
    if destination_names != set(canonical_map):
        missing = sorted(set(canonical_map) - destination_names)
        extra = sorted(destination_names - set(canonical_map))
        if missing:
            errors.append(
                "Integration brand directory is missing synced files: "
                + ", ".join(missing)
            )
        if extra:
            errors.append(
                "Integration brand directory has unexpected PNGs: "
                + ", ".join(extra)
            )

    for name, source_info in canonical_map.items():
        destination = INTEGRATION_BRAND_DIR / name
        if not destination.exists():
            continue
        destination_info = _read_png_info(destination)
        if source_info.sha256 != destination_info.sha256:
            errors.append(
                f"Synced brand asset mismatch for {name}: root and integration copies differ."
            )

    return errors


def print_inventory() -> None:
    for info in (_read_png_info(path) for path in canonical_brand_files()):
        print(
            f"{info.path.relative_to(ROOT)} "
            f"{info.width}x{info.height} "
            f"{info.size_bytes} bytes "
            f"alpha={'yes' if info.has_alpha else 'no'} "
            f"sha256={info.sha256}"
        )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("sync", help="Copy canonical root brand assets into the integration.")
    subparsers.add_parser("validate", help="Validate canonical and synced brand assets.")
    subparsers.add_parser("inventory", help="Print PNG dimensions, sizes, and hashes.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "sync":
            copied = sync_assets()
            for path in copied:
                print(path.relative_to(ROOT))
            return 0
        if args.command == "inventory":
            print_inventory()
            return 0
        errors = validate_assets()
    except ValueError as err:
        print(str(err), file=sys.stderr)
        return 1

    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1

    print("Brand asset validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
