---
name: outreach-review
description: "Weekly review of all outreach targets. Surfaces targets needing first engagement, re-engagement, or ready for connection request."
allowed-tools: Bash
---

# Weekly Outreach Review

## Fetch review data

```bash
CONFIG="${OUTREACH_AUTOPILOT_CONFIG:-$HOME/.outreach-autopilot/config.json}"
CLI="${CLAUDE_PLUGIN_ROOT}/packages/core/dist/cli.js"

# Rebuild if stale
if [ ! -f "${CLI}" ] || [ -n "$(find "${CLAUDE_PLUGIN_ROOT}/packages/core/src" -newer "${CLI}" -print -quit 2>/dev/null)" ]; then
  (cd "${CLAUDE_PLUGIN_ROOT}/packages/core" && pnpm install --silent && pnpm build --silent) >/dev/null 2>&1 || {
    echo "CLI build failed"; exit 1;
  }
fi

node "${CLI}" target review --config "${CONFIG}"
```

## Narrate the output

Parse the JSON output and present a short weekly summary:

- **Needs first engagement** — list each target with name, company, role, and LinkedIn URL. Suggest the user read their recent posts this week and leave one thoughtful comment.
- **Needs re-engagement** — targets last engaged >10 days ago, no connection sent yet. Suggest re-engaging with a new comment on a different post.
- **Ready to connect** — targets engaged 7-10 days ago, no connection sent yet. Suggest running through each and sending a short connection note referencing the prior comment. Draft a note per target if the user asks.
- **Connection pending** — connection requests sent but not yet accepted. List how long ago each was sent.

Keep the summary short. Format as a table or clean bulleted list. Don't pad with motivational language.

## After the review

Ask the user what they want to tackle first. Offer to:
- Draft connection notes for the "ready to connect" list (use `/outreach-draft-comment` logic adapted for connection notes)
- Identify posts to engage with for "needs first engagement"
- Suggest specific re-engagement angles based on each target's file
