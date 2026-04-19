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

```bash
CONFIG="${OUTREACH_AUTOPILOT_CONFIG:-$HOME/.outreach-autopilot/config.json}"
source "${CLAUDE_PLUGIN_ROOT}/scripts/ensure-cli-built.sh" || exit 1

# Read user-provided values from single-quoted heredocs so backticks, $(...),
# and other shell metacharacters in user input cannot execute.
# Each value must fit on one line.

IFS= read -r OA_NAME <<'OA_HEREDOC_NAME'
<NAME>
OA_HEREDOC_NAME
export OA_NAME

IFS= read -r OA_COMPANY <<'OA_HEREDOC_COMPANY'
<COMPANY>
OA_HEREDOC_COMPANY
export OA_COMPANY

IFS= read -r OA_ROLE <<'OA_HEREDOC_ROLE'
<ROLE>
OA_HEREDOC_ROLE
export OA_ROLE

IFS= read -r OA_LINKEDIN <<'OA_HEREDOC_LINKEDIN'
<LINKEDIN_URL>
OA_HEREDOC_LINKEDIN
export OA_LINKEDIN

node "${CLI}" target add \
  --config "${CONFIG}" \
  --name "$OA_NAME" \
  --company "$OA_COMPANY" \
  --role "$OA_ROLE" \
  --linkedin "$OA_LINKEDIN"
```

Substitute `<NAME>`, `<COMPANY>`, `<ROLE>`, `<LINKEDIN_URL>` with the literal user values on the indicated lines. Because those values sit inside single-quoted heredocs, you do NOT need to escape backticks, `$`, `\`, or double quotes — they're read verbatim.

## After creation

Tell the user the target file path that was printed in the JSON output, and suggest they:

1. Open the target file and add research notes under `## Research notes` (what this person cares about, themes in their recent posts, hooks for engagement).
2. Run `/outreach-draft-comment` when they find a post they want to engage with.
