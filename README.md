# outreach-autopilot

Claude Code plugin for AI-assisted LinkedIn outreach. Manages target state and drafts engagement content in your voice, without scraping LinkedIn.

## What it does

- `/outreach-target-add` — add a new outreach target (person at a company you'd want to work with)
- `/outreach-log` — record an engagement (comment, connection request, DM)
- `/outreach-draft-comment` — draft 3 comment options in your voice for a target's post
- `/outreach-review` — weekly review showing who needs attention and what to do next

## Why it exists

LinkedIn outreach works when it's targeted and voice-consistent. That means keeping real notes per person, remembering where each relationship is, and writing comments that sound like you.

This plugin handles the bookkeeping and the drafting. You still do the LinkedIn clicking. No scraping, no TOS risk.

## Setup

See `docs/setup.md`.

## Workflow

See `docs/workflow.md`.

## Architecture

- TypeScript CLI (`packages/core`) handles all state mutations
- State lives in your configured vault as markdown files with YAML frontmatter
- Slash commands shell out to the CLI for mechanical operations and run LLM drafting inline within Claude
- Voice calibration pulls from your own writing samples (blog posts, essays)

## License

MIT
