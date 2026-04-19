# outreach-autopilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code plugin that manages LinkedIn outreach state and drafts engagement artifacts (comments, connection notes) in John's voice, without scraping LinkedIn.

**Architecture:** TypeScript CLI + markdown slash commands, modeled on `oss-autopilot` structure. State lives in a user-configured vault as markdown files with YAML frontmatter. Slash commands shell out to the CLI for mechanical operations and run LLM-driven drafting inline within Claude. No LinkedIn scraping — user pastes content from LinkedIn manually.

**Tech Stack:** TypeScript (ESM) · pnpm workspaces · vitest · commander · gray-matter · zod · Node 20+

---

## Plan meta

**Where this plan lives initially:** `professional-development/self-marketing/outreach-autopilot-implementation-plan.md` (notes vault)

**Target repo:** `github.com/costajohnt/outreach-autopilot` (public, MIT license)

**Voice calibration source:** `~/Documents/notes/blog-posts/` — specifically `you-were-never-typing-code.md` and the AI-assisted development / engineering management post

**Strategy context:** `self-marketing/strategy.md` and `self-marketing/recruiter-outreach.md`

---

## File Structure

```
outreach-autopilot/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/
│   ├── outreach-target-add.md   # /outreach-target-add
│   ├── outreach-log.md          # /outreach-log
│   ├── outreach-draft-comment.md# /outreach-draft-comment
│   └── outreach-review.md       # /outreach-review
├── packages/
│   └── core/
│       ├── src/
│       │   ├── cli.ts           # CLI entry point
│       │   ├── commands/
│       │   │   ├── target-add.ts
│       │   │   ├── target-log.ts
│       │   │   ├── target-list.ts
│       │   │   └── target-review.ts
│       │   ├── lib/
│       │   │   ├── slug.ts      # Name → slug
│       │   │   ├── target.ts    # Target file CRUD
│       │   │   ├── config.ts    # Config loader
│       │   │   └── voice.ts     # Voice sample loader
│       │   └── types.ts         # Shared types (zod schemas)
│       ├── tests/
│       │   ├── slug.test.ts
│       │   ├── target.test.ts
│       │   ├── config.test.ts
│       │   ├── voice.test.ts
│       │   ├── target-add.test.ts
│       │   ├── target-log.test.ts
│       │   ├── target-list.test.ts
│       │   └── target-review.test.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts
├── templates/
│   └── target.md                # Frontmatter + sections template
├── docs/
│   ├── setup.md                 # Install + config
│   ├── workflow.md              # Weekly usage guide
│   └── superpowers/plans/
│       └── 2026-04-18-outreach-autopilot-v1.md  # Copy of this plan
├── package.json                 # Workspace root
├── pnpm-workspace.yaml
├── .gitignore
├── LICENSE
├── README.md
└── .claude-plugin/plugin.json
```

**File responsibilities:**
- `plugin.json` — plugin manifest, matches oss-autopilot schema
- `commands/*.md` — slash command definitions, shell out to CLI for mechanical ops
- `packages/core/src/cli.ts` — single binary with subcommands (`target add`, `target log`, `target list`, `target review`)
- `packages/core/src/lib/*` — pure functions, no side effects except in `target.ts` (file IO)
- `packages/core/src/commands/*` — subcommand implementations, thin wrappers over lib functions
- `templates/target.md` — source template for new target files
- `docs/workflow.md` — how John actually uses this week-to-week

---

## Task 1: Bootstrap repo and plugin manifest

**Files:**
- Create: `outreach-autopilot/.gitignore`
- Create: `outreach-autopilot/LICENSE`
- Create: `outreach-autopilot/README.md`
- Create: `outreach-autopilot/package.json`
- Create: `outreach-autopilot/pnpm-workspace.yaml`
- Create: `outreach-autopilot/.claude-plugin/plugin.json`

- [ ] **Step 1: Create repo directory and git init**

```bash
mkdir -p ~/dev/outreach-autopilot
cd ~/dev/outreach-autopilot
git init -b main
```

- [ ] **Step 2: Create .gitignore**

Create `.gitignore`:

```
node_modules/
dist/
*.log
.DS_Store
.env
.env.local
coverage/
```

- [ ] **Step 3: Create LICENSE (MIT)**

Create `LICENSE`:

```
MIT License

Copyright (c) 2026 John Costa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 4: Create stub README**

Create `README.md`:

```markdown
# outreach-autopilot

Claude Code plugin for AI-assisted LinkedIn outreach. Manages target state and drafts engagement content without scraping LinkedIn.

## Status

v0.1.0 — in development. See `docs/superpowers/plans/2026-04-18-outreach-autopilot-v1.md`.

## Install

(See `docs/setup.md` — written in Task 14)

## Commands

- `/outreach-target-add` — add a new outreach target
- `/outreach-log` — log engagement with a target
- `/outreach-draft-comment` — draft comment options for a target's post
- `/outreach-review` — weekly review, suggest next actions

## License

MIT
```

- [ ] **Step 5: Create workspace package.json**

Create `package.json`:

```json
{
  "name": "outreach-autopilot",
  "version": "0.1.0",
  "description": "Claude Code plugin for AI-assisted LinkedIn outreach",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "typecheck": "pnpm -r run typecheck",
    "lint": "echo 'TODO: eslint' && exit 0"
  },
  "keywords": [
    "claude-code-plugin",
    "linkedin",
    "outreach",
    "recruiting"
  ],
  "author": {
    "name": "John Costa",
    "url": "https://github.com/costajohnt"
  },
  "license": "MIT",
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 6: Create pnpm workspace config**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
```

- [ ] **Step 7: Create plugin manifest**

Create `.claude-plugin/plugin.json`:

```json
{
  "name": "outreach-autopilot",
  "version": "0.1.0",
  "description": "AI-assisted LinkedIn outreach — track targets, draft comments and connection notes in your voice, without scraping LinkedIn",
  "author": {
    "name": "John Costa",
    "url": "https://github.com/costajohnt"
  },
  "repository": "https://github.com/costajohnt/outreach-autopilot",
  "homepage": "https://github.com/costajohnt/outreach-autopilot#readme",
  "license": "MIT",
  "keywords": [
    "linkedin",
    "outreach",
    "recruiting",
    "hiring",
    "job-search",
    "networking"
  ]
}
```

- [ ] **Step 8: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "chore: bootstrap repo and plugin manifest"
```

---

## Task 2: Core package scaffolding (TypeScript + vitest)

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/vitest.config.ts`
- Create: `packages/core/src/cli.ts`
- Create: `packages/core/src/types.ts`
- Create: `packages/core/tests/smoke.test.ts`

- [ ] **Step 1: Create core package.json**

Create `packages/core/package.json`:

```json
{
  "name": "@outreach-autopilot/core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/cli.js",
  "bin": {
    "outreach-autopilot": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "gray-matter": "^4.0.3",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.4.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Create `packages/core/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "tests"]
}
```

- [ ] **Step 3: Create vitest config**

Create `packages/core/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Install dependencies**

```bash
cd ~/dev/outreach-autopilot
pnpm install
```

Expected: installs all deps, creates `node_modules` and `pnpm-lock.yaml`.

- [ ] **Step 5: Create types.ts with zod schemas**

Create `packages/core/src/types.ts`:

```typescript
import { z } from 'zod';

export const TargetStatus = z.enum([
  'researching',
  'engaged',
  'connection_sent',
  'connected',
  'warm',
  'cold',
]);
export type TargetStatus = z.infer<typeof TargetStatus>;

export const TargetFrontmatter = z.object({
  name: z.string(),
  company: z.string(),
  role: z.string(),
  linkedin_url: z.string().url(),
  status: TargetStatus,
  first_engagement: z.string().nullable().optional(),
  last_engagement: z.string().nullable().optional(),
  connection_sent: z.string().nullable().optional(),
  connection_accepted: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});
export type TargetFrontmatter = z.infer<typeof TargetFrontmatter>;

export const Config = z.object({
  vault_path: z.string(),
  voice_samples_path: z.string(),
  voice_sample_files: z.array(z.string()).default([]),
});
export type Config = z.infer<typeof Config>;
```

- [ ] **Step 6: Create smoke test**

Create `packages/core/tests/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { TargetFrontmatter } from '../src/types';

describe('smoke', () => {
  it('zod schema parses a valid target', () => {
    const input = {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
      status: 'researching',
      tags: ['dev-tools'],
    };
    const result = TargetFrontmatter.parse(input);
    expect(result.name).toBe('Alex Smith');
  });
});
```

- [ ] **Step 7: Run smoke test and verify it passes**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test
```

Expected: `smoke.test.ts > smoke > zod schema parses a valid target  ✓` · 1 passed.

- [ ] **Step 8: Create stub cli.ts**

Create `packages/core/src/cli.ts`:

```typescript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();
program
  .name('outreach-autopilot')
  .description('AI-assisted LinkedIn outreach tooling')
  .version('0.1.0');

// Subcommands registered in later tasks

program.parse();
```

- [ ] **Step 9: Build and verify CLI runs**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm build
node dist/cli.js --help
```

Expected: Usage info from commander showing `outreach-autopilot`.

- [ ] **Step 10: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: core package scaffolding with typescript and vitest"
```

---

## Task 3: Slug helper (pure function, TDD)

**Files:**
- Create: `packages/core/src/lib/slug.ts`
- Create: `packages/core/tests/slug.test.ts`

- [ ] **Step 1: Write failing test**

Create `packages/core/tests/slug.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { toSlug } from '../src/lib/slug';

describe('toSlug', () => {
  it('lowercases and kebab-cases simple names', () => {
    expect(toSlug('Alex Smith')).toBe('alex-smith');
  });

  it('handles multiple spaces', () => {
    expect(toSlug('Alex   Smith')).toBe('alex-smith');
  });

  it('strips diacritics', () => {
    expect(toSlug('Álex Ñoño')).toBe('alex-nono');
  });

  it('strips punctuation', () => {
    expect(toSlug('Alex J. Smith')).toBe('alex-j-smith');
  });

  it('trims leading and trailing dashes', () => {
    expect(toSlug('  -alex-  ')).toBe('alex');
  });

  it('collapses runs of dashes', () => {
    expect(toSlug('alex---smith')).toBe('alex-smith');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test slug
```

Expected: FAIL — cannot resolve `'../src/lib/slug'`.

- [ ] **Step 3: Implement toSlug**

Create `packages/core/src/lib/slug.ts`:

```typescript
export function toSlug(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test slug
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: slug helper with TDD coverage"
```

---

## Task 4: Config loader

**Files:**
- Create: `packages/core/src/lib/config.ts`
- Create: `packages/core/tests/config.test.ts`

- [ ] **Step 1: Write failing test**

Create `packages/core/tests/config.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadConfig } from '../src/lib/config';

let tmp: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'oa-'));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('loadConfig', () => {
  it('loads a valid config', () => {
    const configPath = join(tmp, 'config.json');
    writeFileSync(configPath, JSON.stringify({
      vault_path: '/vault',
      voice_samples_path: '/voice',
      voice_sample_files: ['a.md', 'b.md'],
    }));
    const cfg = loadConfig(configPath);
    expect(cfg.vault_path).toBe('/vault');
    expect(cfg.voice_sample_files).toEqual(['a.md', 'b.md']);
  });

  it('fills default voice_sample_files as empty array', () => {
    const configPath = join(tmp, 'config.json');
    writeFileSync(configPath, JSON.stringify({
      vault_path: '/vault',
      voice_samples_path: '/voice',
    }));
    const cfg = loadConfig(configPath);
    expect(cfg.voice_sample_files).toEqual([]);
  });

  it('throws on missing required field', () => {
    const configPath = join(tmp, 'config.json');
    writeFileSync(configPath, JSON.stringify({ vault_path: '/vault' }));
    expect(() => loadConfig(configPath)).toThrow();
  });

  it('throws if file does not exist', () => {
    expect(() => loadConfig(join(tmp, 'missing.json'))).toThrow(/not found/);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test config
```

Expected: FAIL — cannot resolve `'../src/lib/config'`.

- [ ] **Step 3: Implement loadConfig**

Create `packages/core/src/lib/config.ts`:

```typescript
import { readFileSync, existsSync } from 'fs';
import { Config } from '../types';

export function loadConfig(path: string): Config {
  if (!existsSync(path)) {
    throw new Error(`Config not found: ${path}`);
  }
  const raw = readFileSync(path, 'utf-8');
  const parsed = JSON.parse(raw);
  return Config.parse(parsed);
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test config
```

Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: config loader with zod validation"
```

---

## Task 5: Target file CRUD

**Files:**
- Create: `packages/core/src/lib/target.ts`
- Create: `packages/core/tests/target.test.ts`
- Create: `templates/target.md`

- [ ] **Step 1: Create target template**

Create `templates/target.md`:

```markdown
---
name: "{{name}}"
company: "{{company}}"
role: "{{role}}"
linkedin_url: "{{linkedin_url}}"
status: researching
first_engagement: null
last_engagement: null
connection_sent: null
connection_accepted: null
tags: []
---

# {{name}}

## Research notes

(Fill in what they care about, their recent themes, hooks for engagement.)

## Engagement log

(Entries appended here chronologically.)
```

- [ ] **Step 2: Write failing test**

Create `packages/core/tests/target.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import matter from 'gray-matter';
import { createTarget, readTarget, appendEngagement, targetPath } from '../src/lib/target';

let vault: string;

beforeEach(() => {
  vault = mkdtempSync(join(tmpdir(), 'oa-vault-'));
});

afterEach(() => {
  rmSync(vault, { recursive: true, force: true });
});

describe('createTarget', () => {
  it('creates a target file with correct frontmatter', () => {
    const path = createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    expect(existsSync(path)).toBe(true);
    const parsed = matter(readFileSync(path, 'utf-8'));
    expect(parsed.data.name).toBe('Alex Smith');
    expect(parsed.data.status).toBe('researching');
    expect(parsed.data.tags).toEqual([]);
  });

  it('writes file under targets/<slug>.md', () => {
    const path = createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    expect(path).toBe(join(vault, 'targets', 'alex-smith.md'));
  });

  it('throws if target already exists', () => {
    const input = {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    };
    createTarget(vault, input);
    expect(() => createTarget(vault, input)).toThrow(/already exists/);
  });
});

describe('readTarget', () => {
  it('reads a target file and returns parsed frontmatter + body', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    const target = readTarget(vault, 'alex-smith');
    expect(target.frontmatter.name).toBe('Alex Smith');
    expect(target.body).toContain('# Alex Smith');
  });

  it('throws if target does not exist', () => {
    expect(() => readTarget(vault, 'missing')).toThrow(/not found/);
  });
});

describe('appendEngagement', () => {
  it('appends an entry under "Engagement log" section', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    appendEngagement(vault, 'alex-smith', {
      date: '2026-04-20',
      action: 'Commented on their post about TanStack Query',
    });
    const target = readTarget(vault, 'alex-smith');
    expect(target.body).toContain('- 2026-04-20: Commented on their post about TanStack Query');
  });

  it('updates last_engagement date in frontmatter', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    appendEngagement(vault, 'alex-smith', {
      date: '2026-04-20',
      action: 'Commented',
    });
    const target = readTarget(vault, 'alex-smith');
    expect(target.frontmatter.last_engagement).toBe('2026-04-20');
  });

  it('sets first_engagement when empty, keeps it on subsequent entries', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-20', action: 'First' });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-25', action: 'Second' });
    const target = readTarget(vault, 'alex-smith');
    expect(target.frontmatter.first_engagement).toBe('2026-04-20');
    expect(target.frontmatter.last_engagement).toBe('2026-04-25');
  });
});

describe('targetPath', () => {
  it('returns targets/<slug>.md under vault', () => {
    expect(targetPath('/vault', 'alex-smith')).toBe('/vault/targets/alex-smith.md');
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target
```

Expected: FAIL — cannot resolve `'../src/lib/target'`.

- [ ] **Step 4: Implement target.ts**

Create `packages/core/src/lib/target.ts`:

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import matter from 'gray-matter';
import { toSlug } from './slug';
import { TargetFrontmatter } from '../types';

const TEMPLATE_PATH = new URL('../../../../templates/target.md', import.meta.url).pathname;

export interface NewTargetInput {
  name: string;
  company: string;
  role: string;
  linkedin_url: string;
}

export interface TargetFile {
  frontmatter: TargetFrontmatter;
  body: string;
  path: string;
}

export interface EngagementEntry {
  date: string;
  action: string;
}

export function targetPath(vault: string, slug: string): string {
  return join(vault, 'targets', `${slug}.md`);
}

export function createTarget(vault: string, input: NewTargetInput): string {
  const slug = toSlug(input.name);
  const path = targetPath(vault, slug);

  if (existsSync(path)) {
    throw new Error(`Target already exists: ${path}`);
  }

  mkdirSync(dirname(path), { recursive: true });

  const template = readFileSync(TEMPLATE_PATH, 'utf-8');
  const rendered = template
    .replaceAll('{{name}}', input.name)
    .replaceAll('{{company}}', input.company)
    .replaceAll('{{role}}', input.role)
    .replaceAll('{{linkedin_url}}', input.linkedin_url);

  writeFileSync(path, rendered);
  return path;
}

export function readTarget(vault: string, slug: string): TargetFile {
  const path = targetPath(vault, slug);
  if (!existsSync(path)) {
    throw new Error(`Target not found: ${path}`);
  }
  const parsed = matter(readFileSync(path, 'utf-8'));
  return {
    frontmatter: TargetFrontmatter.parse(parsed.data),
    body: parsed.content,
    path,
  };
}

export function appendEngagement(
  vault: string,
  slug: string,
  entry: EngagementEntry,
): void {
  const target = readTarget(vault, slug);
  const line = `- ${entry.date}: ${entry.action}`;

  let body = target.body;
  const marker = '## Engagement log';
  if (body.includes(marker)) {
    body = body.replace(
      marker,
      `${marker}\n\n${line}`,
    );
    body = body.replace(
      `${marker}\n\n${line}\n\n(Entries appended here chronologically.)`,
      `${marker}\n\n${line}`,
    );
  } else {
    body += `\n\n## Engagement log\n\n${line}\n`;
  }

  const frontmatter = { ...target.frontmatter };
  frontmatter.last_engagement = entry.date;
  if (!frontmatter.first_engagement) {
    frontmatter.first_engagement = entry.date;
  }

  const serialized = matter.stringify(body, frontmatter);
  writeFileSync(target.path, serialized);
}
```

- [ ] **Step 5: Run tests, verify they pass**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target
```

Expected: 9 passed.

- [ ] **Step 6: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: target file CRUD (create, read, append engagement)"
```

---

## Task 6: `target add` CLI subcommand

**Files:**
- Create: `packages/core/src/commands/target-add.ts`
- Create: `packages/core/tests/target-add.test.ts`
- Modify: `packages/core/src/cli.ts`

- [ ] **Step 1: Write failing test**

Create `packages/core/tests/target-add.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runTargetAdd } from '../src/commands/target-add';

let tmp: string;
let vault: string;
let configPath: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'oa-'));
  vault = join(tmp, 'vault');
  configPath = join(tmp, 'config.json');
  writeFileSync(configPath, JSON.stringify({
    vault_path: vault,
    voice_samples_path: '/voice',
  }));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('runTargetAdd', () => {
  it('creates a target file under the vault', async () => {
    const result = await runTargetAdd({
      config: configPath,
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin: 'https://linkedin.com/in/alexsmith',
    });
    expect(existsSync(result.path)).toBe(true);
    expect(result.slug).toBe('alex-smith');
  });

  it('throws if required field missing', async () => {
    await expect(runTargetAdd({
      config: configPath,
      name: '',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin: 'https://linkedin.com/in/alexsmith',
    })).rejects.toThrow(/name/);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target-add
```

Expected: FAIL — cannot resolve `'../src/commands/target-add'`.

- [ ] **Step 3: Implement target-add**

Create `packages/core/src/commands/target-add.ts`:

```typescript
import { loadConfig } from '../lib/config';
import { createTarget } from '../lib/target';
import { toSlug } from '../lib/slug';

export interface TargetAddArgs {
  config: string;
  name: string;
  company: string;
  role: string;
  linkedin: string;
}

export interface TargetAddResult {
  slug: string;
  path: string;
}

export async function runTargetAdd(args: TargetAddArgs): Promise<TargetAddResult> {
  if (!args.name) throw new Error('name is required');
  if (!args.company) throw new Error('company is required');
  if (!args.role) throw new Error('role is required');
  if (!args.linkedin) throw new Error('linkedin is required');

  const cfg = loadConfig(args.config);

  const path = createTarget(cfg.vault_path, {
    name: args.name,
    company: args.company,
    role: args.role,
    linkedin_url: args.linkedin,
  });

  return { slug: toSlug(args.name), path };
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target-add
```

Expected: 2 passed.

- [ ] **Step 5: Wire into CLI**

Modify `packages/core/src/cli.ts`:

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { runTargetAdd } from './commands/target-add';

const program = new Command();
program
  .name('outreach-autopilot')
  .description('AI-assisted LinkedIn outreach tooling')
  .version('0.1.0');

const target = program.command('target').description('Target management');

target
  .command('add')
  .description('Add a new outreach target')
  .requiredOption('--config <path>', 'path to config.json')
  .requiredOption('--name <name>')
  .requiredOption('--company <company>')
  .requiredOption('--role <role>')
  .requiredOption('--linkedin <url>')
  .action(async (opts) => {
    const result = await runTargetAdd(opts);
    console.log(JSON.stringify(result, null, 2));
  });

program.parseAsync();
```

- [ ] **Step 6: Build and smoke-test CLI**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm build
mkdir -p /tmp/oa-smoke-vault
echo '{"vault_path":"/tmp/oa-smoke-vault","voice_samples_path":"/tmp"}' > /tmp/oa-smoke-config.json
node dist/cli.js target add \
  --config /tmp/oa-smoke-config.json \
  --name "Alex Smith" \
  --company "Vercel" \
  --role "Head of Engineering" \
  --linkedin "https://linkedin.com/in/alexsmith"
```

Expected: JSON output with `slug: alex-smith` and a valid `path`. File at `/tmp/oa-smoke-vault/targets/alex-smith.md` exists.

- [ ] **Step 7: Clean up smoke test**

```bash
rm -rf /tmp/oa-smoke-vault /tmp/oa-smoke-config.json
```

- [ ] **Step 8: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: target add CLI subcommand with TDD coverage"
```

---

## Task 7: `target log` CLI subcommand

**Files:**
- Create: `packages/core/src/commands/target-log.ts`
- Create: `packages/core/tests/target-log.test.ts`
- Modify: `packages/core/src/cli.ts`

- [ ] **Step 1: Write failing test**

Create `packages/core/tests/target-log.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runTargetLog } from '../src/commands/target-log';
import { createTarget } from '../src/lib/target';

let tmp: string;
let vault: string;
let configPath: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'oa-'));
  vault = join(tmp, 'vault');
  configPath = join(tmp, 'config.json');
  writeFileSync(configPath, JSON.stringify({
    vault_path: vault,
    voice_samples_path: '/voice',
  }));
  createTarget(vault, {
    name: 'Alex Smith',
    company: 'Vercel',
    role: 'Head of Engineering',
    linkedin_url: 'https://linkedin.com/in/alexsmith',
  });
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('runTargetLog', () => {
  it('appends an engagement entry', async () => {
    await runTargetLog({
      config: configPath,
      slug: 'alex-smith',
      date: '2026-04-20',
      action: 'Commented on TanStack Query post',
    });
    const content = readFileSync(join(vault, 'targets', 'alex-smith.md'), 'utf-8');
    expect(content).toContain('- 2026-04-20: Commented on TanStack Query post');
    expect(content).toContain('last_engagement: \'2026-04-20\'');
  });

  it('throws if target slug does not exist', async () => {
    await expect(runTargetLog({
      config: configPath,
      slug: 'missing',
      date: '2026-04-20',
      action: 'something',
    })).rejects.toThrow(/not found/);
  });

  it('defaults date to today when not provided', async () => {
    await runTargetLog({
      config: configPath,
      slug: 'alex-smith',
      action: 'Commented',
    });
    const today = new Date().toISOString().slice(0, 10);
    const content = readFileSync(join(vault, 'targets', 'alex-smith.md'), 'utf-8');
    expect(content).toContain(`- ${today}: Commented`);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target-log
```

Expected: FAIL — cannot resolve.

- [ ] **Step 3: Implement target-log**

Create `packages/core/src/commands/target-log.ts`:

```typescript
import { loadConfig } from '../lib/config';
import { appendEngagement } from '../lib/target';

export interface TargetLogArgs {
  config: string;
  slug: string;
  action: string;
  date?: string;
}

export async function runTargetLog(args: TargetLogArgs): Promise<void> {
  if (!args.slug) throw new Error('slug is required');
  if (!args.action) throw new Error('action is required');

  const cfg = loadConfig(args.config);
  const date = args.date ?? new Date().toISOString().slice(0, 10);

  appendEngagement(cfg.vault_path, args.slug, { date, action: args.action });
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target-log
```

Expected: 3 passed.

- [ ] **Step 5: Wire into CLI**

Modify `packages/core/src/cli.ts` — add a new `target log` subcommand below the existing `target add`:

```typescript
import { runTargetLog } from './commands/target-log';

// ... after target add ...

target
  .command('log')
  .description('Log engagement with a target')
  .requiredOption('--config <path>', 'path to config.json')
  .requiredOption('--slug <slug>', 'target slug')
  .requiredOption('--action <text>', 'what you did')
  .option('--date <YYYY-MM-DD>', 'date (default: today)')
  .action(async (opts) => {
    await runTargetLog(opts);
    console.log(`Logged engagement with ${opts.slug}`);
  });
```

- [ ] **Step 6: Build and smoke test**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm build
mkdir -p /tmp/oa-smoke-vault
echo '{"vault_path":"/tmp/oa-smoke-vault","voice_samples_path":"/tmp"}' > /tmp/oa-smoke-config.json
node dist/cli.js target add --config /tmp/oa-smoke-config.json \
  --name "Alex" --company "Vercel" --role "HoE" --linkedin "https://linkedin.com/in/a"
node dist/cli.js target log --config /tmp/oa-smoke-config.json \
  --slug alex --action "Commented on post" --date 2026-04-20
cat /tmp/oa-smoke-vault/targets/alex.md
rm -rf /tmp/oa-smoke-vault /tmp/oa-smoke-config.json
```

Expected: file contains `- 2026-04-20: Commented on post`.

- [ ] **Step 7: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: target log CLI subcommand"
```

---

## Task 8: `target list` CLI subcommand

**Files:**
- Create: `packages/core/src/commands/target-list.ts`
- Create: `packages/core/tests/target-list.test.ts`
- Modify: `packages/core/src/cli.ts`

- [ ] **Step 1: Write failing test**

Create `packages/core/tests/target-list.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runTargetList } from '../src/commands/target-list';
import { createTarget, appendEngagement } from '../src/lib/target';

let tmp: string;
let vault: string;
let configPath: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'oa-'));
  vault = join(tmp, 'vault');
  configPath = join(tmp, 'config.json');
  writeFileSync(configPath, JSON.stringify({
    vault_path: vault,
    voice_samples_path: '/voice',
  }));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('runTargetList', () => {
  it('returns empty array when no targets', async () => {
    const result = await runTargetList({ config: configPath });
    expect(result).toEqual([]);
  });

  it('lists all targets with their status and last engagement', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    createTarget(vault, {
      name: 'Jamie Lee',
      company: 'Linear',
      role: 'VP Eng',
      linkedin_url: 'https://linkedin.com/in/jamie',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-20', action: 'Commented' });

    const result = await runTargetList({ config: configPath });
    expect(result).toHaveLength(2);

    const alex = result.find((t) => t.slug === 'alex-smith')!;
    expect(alex.name).toBe('Alex Smith');
    expect(alex.company).toBe('Vercel');
    expect(alex.last_engagement).toBe('2026-04-20');

    const jamie = result.find((t) => t.slug === 'jamie-lee')!;
    expect(jamie.last_engagement).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target-list
```

Expected: FAIL.

- [ ] **Step 3: Implement target-list**

Create `packages/core/src/commands/target-list.ts`:

```typescript
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { loadConfig } from '../lib/config';
import { readTarget } from '../lib/target';

export interface TargetListArgs {
  config: string;
}

export interface TargetSummary {
  slug: string;
  name: string;
  company: string;
  role: string;
  status: string;
  first_engagement: string | null;
  last_engagement: string | null;
  connection_sent: string | null;
  connection_accepted: string | null;
}

export async function runTargetList(args: TargetListArgs): Promise<TargetSummary[]> {
  const cfg = loadConfig(args.config);
  const targetsDir = join(cfg.vault_path, 'targets');
  if (!existsSync(targetsDir)) return [];

  const files = readdirSync(targetsDir).filter((f) => f.endsWith('.md'));

  return files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const target = readTarget(cfg.vault_path, slug);
    const fm = target.frontmatter;
    return {
      slug,
      name: fm.name,
      company: fm.company,
      role: fm.role,
      status: fm.status,
      first_engagement: fm.first_engagement ?? null,
      last_engagement: fm.last_engagement ?? null,
      connection_sent: fm.connection_sent ?? null,
      connection_accepted: fm.connection_accepted ?? null,
    };
  });
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target-list
```

Expected: 2 passed.

- [ ] **Step 5: Wire into CLI**

Modify `packages/core/src/cli.ts` — add:

```typescript
import { runTargetList } from './commands/target-list';

// ... after target log ...

target
  .command('list')
  .description('List all targets')
  .requiredOption('--config <path>', 'path to config.json')
  .action(async (opts) => {
    const result = await runTargetList(opts);
    console.log(JSON.stringify(result, null, 2));
  });
```

- [ ] **Step 6: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: target list CLI subcommand"
```

---

## Task 9: `target review` — surface stale and pending targets

**Files:**
- Create: `packages/core/src/commands/target-review.ts`
- Create: `packages/core/tests/target-review.test.ts`
- Modify: `packages/core/src/cli.ts`

- [ ] **Step 1: Write failing test**

Create `packages/core/tests/target-review.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runTargetReview } from '../src/commands/target-review';
import { createTarget, appendEngagement } from '../src/lib/target';

let tmp: string;
let vault: string;
let configPath: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'oa-'));
  vault = join(tmp, 'vault');
  configPath = join(tmp, 'config.json');
  writeFileSync(configPath, JSON.stringify({
    vault_path: vault,
    voice_samples_path: '/voice',
  }));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('runTargetReview', () => {
  it('flags targets with no engagement as "needs first engagement"', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.needs_first_engagement).toHaveLength(1);
    expect(review.needs_first_engagement[0].slug).toBe('alex-smith');
  });

  it('flags targets engaged >10 days ago as "needs re-engagement"', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-01', action: 'Commented' });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.needs_reengagement).toHaveLength(1);
    expect(review.needs_reengagement[0].slug).toBe('alex-smith');
  });

  it('flags targets ready for connection request (engaged 7-10 days, no connection sent)', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-12', action: 'Commented' });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.ready_to_connect).toHaveLength(1);
    expect(review.ready_to_connect[0].slug).toBe('alex-smith');
  });

  it('does not re-flag targets with connection already sent', async () => {
    // Will be implemented once connection tracking is added; placeholder test here
    // asserts that connection_sent blocks the ready_to_connect path
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-12', action: 'Commented' });
    // Manually set connection_sent in frontmatter
    const { readFileSync, writeFileSync } = await import('fs');
    const path = join(vault, 'targets', 'alex-smith.md');
    const content = readFileSync(path, 'utf-8');
    const updated = content.replace(
      'connection_sent: null',
      `connection_sent: '2026-04-15'`,
    );
    writeFileSync(path, updated);

    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.ready_to_connect).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target-review
```

Expected: FAIL — cannot resolve.

- [ ] **Step 3: Implement target-review**

Create `packages/core/src/commands/target-review.ts`:

```typescript
import { runTargetList, TargetSummary } from './target-list';

export interface TargetReviewArgs {
  config: string;
  today?: string;
}

export interface TargetReview {
  needs_first_engagement: TargetSummary[];
  needs_reengagement: TargetSummary[];
  ready_to_connect: TargetSummary[];
  connection_pending: TargetSummary[];
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function runTargetReview(args: TargetReviewArgs): Promise<TargetReview> {
  const targets = await runTargetList({ config: args.config });
  const today = args.today ?? new Date().toISOString().slice(0, 10);

  const needs_first_engagement = targets.filter(
    (t) => t.first_engagement === null && t.connection_sent === null,
  );

  const needs_reengagement = targets.filter(
    (t) =>
      t.last_engagement !== null &&
      t.connection_sent === null &&
      daysBetween(t.last_engagement, today) > 10,
  );

  const ready_to_connect = targets.filter(
    (t) =>
      t.last_engagement !== null &&
      t.connection_sent === null &&
      daysBetween(t.last_engagement, today) >= 7 &&
      daysBetween(t.last_engagement, today) <= 10,
  );

  const connection_pending = targets.filter(
    (t) => t.connection_sent !== null && t.connection_accepted === null,
  );

  return {
    needs_first_engagement,
    needs_reengagement,
    ready_to_connect,
    connection_pending,
  };
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test target-review
```

Expected: 4 passed.

- [ ] **Step 5: Wire into CLI**

Modify `packages/core/src/cli.ts` — add:

```typescript
import { runTargetReview } from './commands/target-review';

// ... after target list ...

target
  .command('review')
  .description('Weekly review: surface targets needing action')
  .requiredOption('--config <path>', 'path to config.json')
  .option('--today <YYYY-MM-DD>', 'override today (for testing)')
  .action(async (opts) => {
    const result = await runTargetReview(opts);
    console.log(JSON.stringify(result, null, 2));
  });
```

- [ ] **Step 6: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: target review CLI subcommand with engagement state buckets"
```

---

## Task 10: Voice samples loader

**Files:**
- Create: `packages/core/src/lib/voice.ts`
- Create: `packages/core/tests/voice.test.ts`

- [ ] **Step 1: Write failing test**

Create `packages/core/tests/voice.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadVoiceSamples } from '../src/lib/voice';

let tmp: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'oa-voice-'));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('loadVoiceSamples', () => {
  it('loads specified sample files', () => {
    writeFileSync(join(tmp, 'a.md'), '# Post A\n\nContent A.');
    writeFileSync(join(tmp, 'b.md'), '# Post B\n\nContent B.');
    const samples = loadVoiceSamples(tmp, ['a.md', 'b.md']);
    expect(samples).toHaveLength(2);
    expect(samples[0].filename).toBe('a.md');
    expect(samples[0].content).toContain('Content A');
    expect(samples[1].filename).toBe('b.md');
  });

  it('skips files that do not exist, warns via return', () => {
    writeFileSync(join(tmp, 'a.md'), '# Post A');
    const samples = loadVoiceSamples(tmp, ['a.md', 'missing.md']);
    expect(samples).toHaveLength(1);
    expect(samples[0].filename).toBe('a.md');
  });

  it('returns empty array when no files listed', () => {
    const samples = loadVoiceSamples(tmp, []);
    expect(samples).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test voice
```

Expected: FAIL.

- [ ] **Step 3: Implement voice loader**

Create `packages/core/src/lib/voice.ts`:

```typescript
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface VoiceSample {
  filename: string;
  content: string;
}

export function loadVoiceSamples(
  basePath: string,
  filenames: string[],
): VoiceSample[] {
  return filenames
    .map((filename) => {
      const path = join(basePath, filename);
      if (!existsSync(path)) return null;
      return { filename, content: readFileSync(path, 'utf-8') };
    })
    .filter((s): s is VoiceSample => s !== null);
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd ~/dev/outreach-autopilot/packages/core
pnpm test voice
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: voice samples loader"
```

---

## Task 11: Slash command `/outreach-target-add`

**Files:**
- Create: `commands/outreach-target-add.md`

- [ ] **Step 1: Create slash command**

Create `commands/outreach-target-add.md`:

````markdown
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
````

- [ ] **Step 2: Manual sanity check the command file**

```bash
cat ~/dev/outreach-autopilot/commands/outreach-target-add.md
```

Expected: file present with correct frontmatter and body.

- [ ] **Step 3: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: /outreach-target-add slash command"
```

---

## Task 12: Slash command `/outreach-log`

**Files:**
- Create: `commands/outreach-log.md`

- [ ] **Step 1: Create slash command**

Create `commands/outreach-log.md`:

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: /outreach-log slash command"
```

---

## Task 13: Slash command `/outreach-draft-comment`

**Files:**
- Create: `commands/outreach-draft-comment.md`

- [ ] **Step 1: Create slash command**

This command does its drafting work inline within Claude (not via CLI), since it's LLM-heavy. The CLI is used only to read the target file and voice samples.

Create `commands/outreach-draft-comment.md`:

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: /outreach-draft-comment slash command with voice calibration"
```

---

## Task 14: Slash command `/outreach-review`

**Files:**
- Create: `commands/outreach-review.md`

- [ ] **Step 1: Create slash command**

Create `commands/outreach-review.md`:

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "feat: /outreach-review slash command"
```

---

## Task 15: Documentation — setup and workflow guides

**Files:**
- Create: `docs/setup.md`
- Create: `docs/workflow.md`
- Modify: `README.md`

- [ ] **Step 1: Create setup guide**

Create `docs/setup.md`:

````markdown
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
````

- [ ] **Step 2: Create workflow guide**

Create `docs/workflow.md`:

````markdown
# Workflow

## Weekly rhythm

**Monday (5 min):**
- Run `/outreach-review` to see what needs attention this week
- Pick 3-5 targets to engage with

**Tuesday through Friday (5 min/day):**
- Check each target's LinkedIn profile for recent posts
- For each post that's worth engaging with, run `/outreach-draft-comment` and post one comment
- After posting, run `/outreach-log` to record the engagement

**Friday (5 min):**
- Run `/outreach-review`
- For targets in "ready to connect" bucket, send connection requests with a short note referencing the prior comment
- Run `/outreach-log` with action like "Connection sent, note referencing X" after each

**Monthly:**
- Review `/outreach-review` output for patterns — what's converting, what's not
- Add 5-10 new targets to the list
- Prune targets that have gone cold (mark status `cold` in their file)

## Adding a new target

1. Run `/outreach-target-add`
2. Answer the prompts (name, company, role, LinkedIn URL)
3. Open the target file Claude created
4. Under `## Research notes`, add:
   - What they post about (their themes)
   - Recent notable posts
   - Hooks for your first comment
   - Any mutual connections

## Finding posts to engage with

- Check target's LinkedIn profile → Activity tab → Posts
- Look for posts in the past 7-14 days
- Prefer posts with <50 comments (you're more likely to be seen)
- Prefer posts where you have a genuine take, not empty agreement
````

- [ ] **Step 3: Update README**

Replace the stub `README.md` created in Task 1 with:

````markdown
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
````

- [ ] **Step 4: Verify docs build**

```bash
cd ~/dev/outreach-autopilot
ls docs/
cat README.md | head -20
```

Expected: `setup.md` and `workflow.md` exist, README has been updated.

- [ ] **Step 5: Commit**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "docs: add setup guide, workflow guide, and README"
```

---

## Task 16: Copy this plan into the repo and publish

**Files:**
- Create: `docs/superpowers/plans/2026-04-18-outreach-autopilot-v1.md`
- Remote: create `github.com/costajohnt/outreach-autopilot`

- [ ] **Step 1: Copy the plan into the repo**

```bash
mkdir -p ~/dev/outreach-autopilot/docs/superpowers/plans
cp "/Users/johncosta/Library/Mobile Documents/iCloud~md~obsidian/Documents/notes/professional-development/self-marketing/outreach-autopilot-implementation-plan.md" \
   ~/dev/outreach-autopilot/docs/superpowers/plans/2026-04-18-outreach-autopilot-v1.md
```

- [ ] **Step 2: Run full test suite and typecheck**

```bash
cd ~/dev/outreach-autopilot
pnpm typecheck
pnpm test
```

Expected: all typecheck passes, all tests pass.

- [ ] **Step 3: Commit the plan copy**

```bash
cd ~/dev/outreach-autopilot
git add .
git commit -m "docs: include v1 implementation plan in repo"
```

- [ ] **Step 4: Create GitHub repo**

Ask the user to create `github.com/costajohnt/outreach-autopilot` as a public repo with no initialization (no README, no gitignore, no license — we have all of these).

Once created, push:

```bash
cd ~/dev/outreach-autopilot
git remote add origin git@github.com:costajohnt/outreach-autopilot.git
git push -u origin main
```

- [ ] **Step 5: Verify the repo looks right on GitHub**

Visit `https://github.com/costajohnt/outreach-autopilot` and confirm:
- README renders
- Commits are present
- LICENSE is detected
- No secrets committed (config.json is gitignored by default since it's not in the repo)

- [ ] **Step 6: Update GitHub profile README**

Once `github-profile.md` work is complete, add `outreach-autopilot` to the "What I'm building" section as a new pinned repo.

---

## Self-Review

### Spec coverage
Walking through the three buckets in `self-marketing/strategy.md`:

- **Bucket 1 (LinkedIn profile landing page):** Not covered — this plan is for the tool only. That work lives in `linkedin-profile-work.md` and doesn't require a tool.
- **Bucket 2 (cross-channel gaps):** Not covered — handled in `github-profile.md` and `jcosta-tech-additions.md`. Outside scope of this plan.
- **Bucket 3 (behavior change: commenting + recruiter outreach):** Directly supported. `/outreach-target-add`, `/outreach-draft-comment`, `/outreach-log`, `/outreach-review` cover the entire recruiter/hiring-manager workflow in `recruiter-outreach.md` and the commenting practice in `commenting-strategy.md`.

Inbound tracking (`inbound-log.md`) is NOT covered by this v1. That's intentional — inbound messages come through LinkedIn's UI and are easy to log manually into the existing markdown file. Adding `/outreach-inbound` is a reasonable v1.1.

### Placeholder scan
- No "TBD", "TODO", "fill in details"
- No "similar to Task N" references
- All code blocks show complete implementations
- All commands have exact paths

### Type consistency
- `TargetFrontmatter` used consistently across `types.ts`, `target.ts`, `target-list.ts`
- `TargetStatus` values used consistently: `researching | engaged | connection_sent | connected | warm | cold`
- `appendEngagement` signature stable across all call sites
- `loadConfig` returns `Config` used consistently
- CLI subcommand names stable: `target add`, `target log`, `target list`, `target review`

### Scope check
- Single plugin, single package, single clear purpose
- 16 tasks, each producing a working self-contained change
- Suitable for one focused weekend or three evening sessions

### Known deferred / v1.1 candidates
- `/outreach-inbound` command (currently covered by editing `inbound-log.md` manually)
- `/outreach-draft-connection` (currently covered by `/outreach-draft-comment` prompting for connection-note context)
- Dashboard (HTML summary view of the review state — oss-autopilot has this, but defer until v2)
- Connection-acceptance tracking (user would need to update frontmatter by hand; automating this requires LinkedIn-side signal we don't have)
- Multiple-vault support (v1 is single-vault only)
- Export/import from other CRMs

---

## Execution options

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch with checkpoints.

Pick one and tell Claude when you're ready to start. Or park this plan and come back when you have a weekend to spare.
