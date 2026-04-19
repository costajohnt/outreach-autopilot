# Setup

## Requirements

- Node.js 20+
- pnpm 8+
- Claude Code

## Install

1. Clone the repo:

   ```bash
   git clone https://github.com/costajohnt/outreach-autopilot ~/dev/outreach-autopilot
   cd ~/dev/outreach-autopilot
   ```

2. Install dependencies and build:

   ```bash
   pnpm install
   pnpm build
   ```

3. Make the plugin available to Claude Code:

   Claude Code discovers plugins via its marketplace/config flow. The simplest path is to add a local plugin entry pointing at this checkout. From within Claude Code, you can typically run:

   ```
   /plugin marketplace add ~/dev/outreach-autopilot
   /plugin install outreach-autopilot
   ```

   If those commands don't match your Claude Code version, run `claude --help` or check the plugin docs for your installation. The plugin root must be `~/dev/outreach-autopilot` (the directory containing `.claude-plugin/plugin.json`).

## Configure

Create a config file at `~/.outreach-autopilot/config.json`:

```json
{
  "vault_path": "/Users/you/path/to/your/vault",
  "voice_samples_path": "/Users/you/path/to/your/blog-posts",
  "voice_sample_files": [
    "your-best-post.md",
    "another-good-post.md"
  ]
}
```

- `vault_path` — a directory where target files will live (any existing or new folder)
- `voice_samples_path` — folder containing markdown files that represent your writing voice
- `voice_sample_files` — 1-3 filenames that best represent your voice

The plugin creates `<vault_path>/targets/` on first use.

## Environment variable (optional)

If you want to use a non-default config location, set:

```bash
export OUTREACH_AUTOPILOT_CONFIG=/path/to/your/config.json
```

## Verify install

In Claude Code, run:

```
/outreach-review
```

You should see an empty review (no targets yet).
