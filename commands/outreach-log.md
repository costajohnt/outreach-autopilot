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
source "${CLAUDE_PLUGIN_ROOT}/scripts/ensure-cli-built.sh" || exit 1

IFS= read -r OA_SLUG <<'OA_HEREDOC_SLUG'
<SLUG>
OA_HEREDOC_SLUG
export OA_SLUG

IFS= read -r OA_ACTION <<'OA_HEREDOC_ACTION'
<ACTION>
OA_HEREDOC_ACTION
export OA_ACTION

IFS= read -r OA_DATE <<'OA_HEREDOC_DATE'
<DATE_OR_EMPTY>
OA_HEREDOC_DATE
export OA_DATE

if [ -n "$OA_DATE" ]; then
  node "${CLI}" target log --config "${CONFIG}" --slug "$OA_SLUG" --action "$OA_ACTION" --date "$OA_DATE"
else
  node "${CLI}" target log --config "${CONFIG}" --slug "$OA_SLUG" --action "$OA_ACTION"
fi
```

Each value must fit on one line (read -r reads one line).

Substitute `<SLUG>`, `<ACTION>`, and `<DATE_OR_EMPTY>` (leave blank for today). Values are read verbatim inside single-quoted heredocs, so no escaping is needed.

## After logging

Confirm to the user what was logged and which file was updated. Suggest running `/outreach-review` at the end of the week.
