---
name: outreach-log
description: "Log engagement with a LinkedIn outreach target (comment, connection request, DM, reply)."
allowed-tools: Bash
---

# Log Outreach Engagement

Ask the user:

1. **Target slug** (or name — you'll slugify it the same way the CLI does: lowercase, kebab, strip diacritics and punctuation)
2. **What you did** — short description (e.g., "Commented on their TanStack Query post", "Connection request sent with note about Ink", "Replied to their thread on AI dev tooling")
3. **Date** (optional, defaults to today — confirm today's date is correct)

If the user provides a name instead of a slug, run the slug conversion inline: lowercase, replace non-alphanumerics with dashes, collapse repeated dashes, trim.

## Log the engagement

```bash
CONFIG="${OUTREACH_AUTOPILOT_CONFIG:-$HOME/.outreach-autopilot/config.json}"
CLI="${CLAUDE_PLUGIN_ROOT}/packages/core/dist/cli.js"

# Rebuild if stale (same check as outreach-target-add)
if [ ! -f "${CLI}" ] || [ -n "$(find "${CLAUDE_PLUGIN_ROOT}/packages/core/src" -newer "${CLI}" -print -quit 2>/dev/null)" ]; then
  (cd "${CLAUDE_PLUGIN_ROOT}/packages/core" && pnpm install --silent && pnpm build --silent) >/dev/null 2>&1 || {
    echo "CLI build failed"; exit 1;
  }
fi

node "${CLI}" target log \
  --config "${CONFIG}" \
  --slug "<SLUG>" \
  --action "<ACTION>" \
  ${DATE:+--date "$DATE"}
```

Replace `<SLUG>` and `<ACTION>` with collected values. Only include `--date` if the user provided one.

## After logging

Confirm to the user what was logged and which file was updated. Suggest running `/outreach-review` at the end of the week.
