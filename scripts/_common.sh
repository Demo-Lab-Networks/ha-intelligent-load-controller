#!/usr/bin/env bash
# Shared safe helpers for local development commands. This file is sourced by
# the executable scripts in this directory; it is not intended to be run alone.

set -euo pipefail

readonly ILC_ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

ilc_python() {
  if [[ -x "${ILC_ROOT_DIR}/.venv/bin/python" ]]; then
    printf '%s\n' "${ILC_ROOT_DIR}/.venv/bin/python"
    return
  fi
  printf '%s\n' "${PYTHON_BIN:-python3.13}"
}

require_python() {
  local python_bin
  python_bin="$(ilc_python)"
  if ! command -v "${python_bin}" >/dev/null 2>&1; then
    printf 'Python 3.13 is required. Run scripts/bootstrap in the devcontainer or set PYTHON_BIN to a Python 3.13 executable.\n' >&2
    return 2
  fi
  "${python_bin}" -c 'import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 13) else 1)' || {
    printf 'Python 3.13 is required; selected interpreter is: %s\n' "${python_bin}" >&2
    return 2
  }
}

require_node() {
  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    printf 'Node.js and npm are required. Use the devcontainer or install Node 22.\n' >&2
    return 2
  fi
  local version major minor
  version="$(node --version)"
  if [[ ! "${version}" =~ ^v([0-9]+)\.([0-9]+)\.[0-9]+$ ]]; then
    printf 'Unable to determine the Node.js version; found: %s\n' "${version}" >&2
    return 2
  fi
  major="${BASH_REMATCH[1]}"
  minor="${BASH_REMATCH[2]}"
  if (( major != 22 || minor < 12 )); then
    printf 'Node.js >=22.12.0 and <23 is required; found: %s\n' "${version}" >&2
    return 2
  fi
}

require_frontend_install() {
  if [[ ! -d "${ILC_ROOT_DIR}/frontend/node_modules" ]]; then
    printf 'Frontend dependencies are not installed. Run scripts/bootstrap first.\n' >&2
    return 2
  fi
}
