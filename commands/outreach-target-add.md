---
name: outreach-target-add
description: "Add a new LinkedIn outreach target. Prompts for name, company, role, and LinkedIn URL, then creates a target file in your vault."
allowed-tools: Bash
---

# Add Outreach Target

Ask the user for the target's details conversationally. Collect these fields one at a time if not provided:

1. **Name** (full name as shown on LinkedIn)
2. **Company** (current company)
3. **Role** (current role / title)
4. **LinkedIn URL** (full URL, `https://linkedin.com/in/...`)

Once all four are collected, confirm with the user before creating.

## Create the target

Build the shell command carefully. Escape each argument using double quotes. Resolve the config path from the environment variable `$OUTREACH_AUTOPILOT_CONFIG` if set, otherwise use `~/.outreach-autopilot/config.json`.

```bash
CONFIG="${OUTREACH_AUTOPILOT_CONFIG:-$HOME/.outreach-autopilot/config.json}"
CLI="${CLAUDE_PLUGIN_ROOT}/packages/core/dist/cli.js"

# Rebuild if stale
if [ ! -f "${CLI}" ] || [ -n "$(find "${CLAUDE_PLUGIN_ROOT}/packages/core/src" -newer "${CLI}" -print -quit 2>/dev/null)" ]; then
  (cd "${CLAUDE_PLUGIN_ROOT}/packages/core" && pnpm install --silent && pnpm build --silent) >/dev/null 2>&1 || {
    echo "CLI build failed"; exit 1;
  }
fi

node "${CLI}" target add \
  --config "${CONFIG}" \
  --name "<NAME>" \
  --company "<COMPANY>" \
  --role "<ROLE>" \
  --linkedin "<LINKEDIN_URL>"
```

Replace `<NAME>`, `<COMPANY>`, `<ROLE>`, `<LINKEDIN_URL>` with the actual collected values (still wrapped in double quotes so spaces are preserved).

## After creation

Tell the user the target file path that was printed in the JSON output, and suggest they:

1. Open the target file and add research notes under `## Research notes` (what this person cares about, themes in their recent posts, hooks for engagement).
2. Run `/outreach-draft-comment` when they find a post they want to engage with.
