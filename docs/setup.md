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

2. Install the plugin in Claude Code:

   Copy or symlink into your Claude Code plugins directory. (See Claude Code plugin docs for current install path.)

3. Install dependencies and build:

   ```bash
   pnpm install
   pnpm build
   ```

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
