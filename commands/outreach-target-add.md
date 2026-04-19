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

Pass user-provided values as environment variables to avoid shell injection from special characters in names, companies, or roles (double quotes, backticks, `$`, etc.).

```bash
CONFIG="${OUTREACH_AUTOPILOT_CONFIG:-$HOME/.outreach-autopilot/config.json}"
source "${CLAUDE_PLUGIN_ROOT}/scripts/ensure-cli-built.sh" || exit 1

# Set env vars with user input (model must substitute the literal values for the placeholders).
# Because env var values are passed to the CLI as argv through "$VAR" expansion,
# shell metacharacters in the values are safe.
export OA_NAME="<NAME>"
export OA_COMPANY="<COMPANY>"
export OA_ROLE="<ROLE>"
export OA_LINKEDIN="<LINKEDIN_URL>"

node "${CLI}" target add \
  --config "${CONFIG}" \
  --name "$OA_NAME" \
  --company "$OA_COMPANY" \
  --role "$OA_ROLE" \
  --linkedin "$OA_LINKEDIN"
```

Substitute `<NAME>`, `<COMPANY>`, `<ROLE>`, `<LINKEDIN_URL>` with the actual collected values. Double-quote characters inside those values should be escaped with a backslash before substitution (`O'Brien` is fine; `She said "hi"` should become `She said \"hi\"`).

## After creation

Tell the user the target file path that was printed in the JSON output, and suggest they:

1. Open the target file and add research notes under `## Research notes` (what this person cares about, themes in their recent posts, hooks for engagement).
2. Run `/outreach-draft-comment` when they find a post they want to engage with.
