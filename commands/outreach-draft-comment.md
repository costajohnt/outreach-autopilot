---
name: outreach-draft-comment
description: "Draft 2-3 thoughtful comment options in the user's voice for a specific LinkedIn post from a target."
allowed-tools: Bash, Read
---

# Draft Comment for Target's Post

Ask the user:

1. **Target slug** (or name)
2. **The post they want to comment on** — ask them to paste the full text of the post. If they also want to share the URL and any thread context, accept that.
3. **Optional context** — anything specific they want the comment to emphasize or avoid.

## Gather context

Build the config path the same way as other commands:

```bash
CONFIG="${OUTREACH_AUTOPILOT_CONFIG:-$HOME/.outreach-autopilot/config.json}"
```

Read the config to get `vault_path` and `voice_samples_path`.

Then read:

- Target file: `<vault_path>/targets/<slug>.md` — the frontmatter and research notes
- Voice samples: each file in `voice_sample_files` from the voice_samples_path

Read these using the Read tool.

## Voice guidelines

The user's voice (calibrate from the samples you just read):

- Short, direct sentences
- No em dashes (period)
- No corporate buzzwords: no "leveraging," "enabling," "championing," "instilling"
- No throat-clearing or flattery ("great post", "100%", "this!")
- Often adds a concrete example, a gentle counterpoint, or a specific related experience
- Never self-promotes, never ends with "check out my blog"

## Draft comments

Generate **exactly 3** comment options, each 1-3 sentences. Make each option take a different approach:

1. **Concrete example:** cite something specific you've built or seen that relates to the post
2. **Gentle pushback or extension:** add a nuance or counterpoint politely, rooted in experience
3. **Useful question:** a question that invites the poster to say more, grounded in a concrete scenario

Present the three options clearly labeled. Remind the user they can pick one, mix elements, or ask for another round.

## After drafting

After the user picks one and posts it, suggest they run `/outreach-log` to record the engagement.
