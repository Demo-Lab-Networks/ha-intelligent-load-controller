#!/usr/bin/env python3
"""Run deterministic controller simulations and optionally write evidence files."""

from __future__ import annotations

import argparse
import sys
from importlib import import_module
from pathlib import Path
from typing import Any

# This repository deliberately is not an installable Python package: Home
# Assistant loads it from ``custom_components``. Make the project root
# available when this standalone evidence script is executed directly.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


def _simulation_api() -> tuple[Any, Any]:
    """Load the pure simulation module after direct-script path setup."""

    module = import_module("custom_components.intelligent_load_controller.controller.simulation")
    return module.default_scenarios, module.run_suite


def _arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--seed",
        type=int,
        default=20260722,
        help="Deterministic suite seed (default: %(default)s).",
    )
    parser.add_argument(
        "--scenario",
        action="append",
        default=[],
        metavar="ID",
        help="Run only a built-in scenario ID; repeat to select several.",
    )
    parser.add_argument(
        "--json-output",
        type=Path,
        help="Write the machine-readable JSON report to this path.",
    )
    parser.add_argument(
        "--markdown-output",
        type=Path,
        help="Write the human-readable Markdown report to this path.",
    )
    parser.add_argument(
        "--csv-output", type=Path, help="Write the per-slot CSV report to this path."
    )
    parser.add_argument(
        "--print-json",
        action="store_true",
        help="Print JSON rather than Markdown when no report path is given.",
    )
    return parser.parse_args()


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def main() -> int:
    arguments = _arguments()
    default_scenarios, run_suite = _simulation_api()
    scenarios = default_scenarios(seed=arguments.seed)
    by_id = {scenario.scenario_id: scenario for scenario in scenarios}
    requested = arguments.scenario or list(by_id)
    unknown = sorted(set(requested) - set(by_id))
    if unknown:
        print(f"Unknown built-in simulation scenario(s): {', '.join(unknown)}", file=sys.stderr)
        return 2
    suite = run_suite(tuple(by_id[scenario_id] for scenario_id in requested))
    json_report = suite.to_json()
    markdown_report = suite.to_markdown()
    csv_report = suite.to_csv()
    if arguments.json_output is not None:
        _write(arguments.json_output, json_report)
    if arguments.markdown_output is not None:
        _write(arguments.markdown_output, markdown_report)
    if arguments.csv_output is not None:
        _write(arguments.csv_output, csv_report)
    if not any((arguments.json_output, arguments.markdown_output, arguments.csv_output)):
        print(json_report if arguments.print_json else markdown_report, end="")
    return 0 if suite.passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
