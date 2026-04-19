#!/usr/bin/env bash
# Ensures the outreach-autopilot CLI is built and up-to-date.
# Called by slash commands before invoking `node $CLI ...`.
# Sets $CLI (path to compiled cli.js) on success.
# Exits non-zero with a diagnostic message on failure.

set -o pipefail

if [ -z "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  echo "ensure-cli-built: CLAUDE_PLUGIN_ROOT is not set" >&2
  exit 1
fi

CORE_DIR="${CLAUDE_PLUGIN_ROOT}/packages/core"
SRC_DIR="${CORE_DIR}/src"
CLI="${CORE_DIR}/dist/cli.js"

if [ ! -d "${SRC_DIR}" ]; then
  echo "ensure-cli-built: source directory missing: ${SRC_DIR}" >&2
  exit 1
fi

# Rebuild if CLI missing or any source file newer
if [ ! -f "${CLI}" ] || [ -n "$(find "${SRC_DIR}" -newer "${CLI}" -print -quit 2>/dev/null)" ]; then
  if ! BUILD_OUT=$( (cd "${CORE_DIR}" && pnpm install --silent && pnpm build --silent) 2>&1 ); then
    echo "ensure-cli-built: CLI build failed" >&2
    echo "${BUILD_OUT}" >&2
    exit 1
  fi
fi

# Export CLI so callers can use it
export CLI
