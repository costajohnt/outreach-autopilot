import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const CLI_PATH = resolve(__dirname, '..', 'dist', 'cli.js');

function run(args: string[]): { status: number; stdout: string; stderr: string } {
  const res = spawnSync(process.execPath, [CLI_PATH, ...args], {
    encoding: 'utf-8',
    env: { ...process.env, OUTREACH_AUTOPILOT_CONFIG: undefined },
  });
  return {
    status: res.status ?? -1,
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
  };
}

let tmp: string;
let vault: string;
let voicePath: string;
let configPath: string;

beforeAll(() => {
  if (!existsSync(CLI_PATH)) {
    throw new Error(
      `CLI bundle not found at ${CLI_PATH}. Run \`pnpm build\` in packages/core before running tests, or add a prebuild step to your test runner config.`,
    );
  }
});

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'oa-cli-smoke-'));
  vault = join(tmp, 'vault');
  voicePath = join(tmp, 'voice');
  configPath = join(tmp, 'config.json');
  writeFileSync(configPath, JSON.stringify({
    vault_path: vault,
    voice_samples_path: voicePath,
    voice_sample_files: [],
  }));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('CLI smoke: --help', () => {
  it('top-level --help returns 0 and shows program name', () => {
    const res = run(['--help']);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('outreach-autopilot');
  });

  it('--version returns 0 and prints 0.1.0', () => {
    const res = run(['--version']);
    expect(res.status).toBe(0);
    expect(res.stdout.trim()).toBe('0.1.0');
  });

  it('target --help returns 0 and lists subcommands', () => {
    const res = run(['target', '--help']);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('add');
    expect(res.stdout).toContain('log');
    expect(res.stdout).toContain('list');
    expect(res.stdout).toContain('review');
  });
});

describe('CLI smoke: target add', () => {
  it('creates a target and returns JSON with slug + path on stdout', () => {
    const res = run([
      'target', 'add',
      '--config', configPath,
      '--name', 'Alex Smith',
      '--company', 'Vercel',
      '--role', 'Head of Engineering',
      '--linkedin', 'https://linkedin.com/in/alex',
    ]);
    expect(res.status).toBe(0);
    const parsed = JSON.parse(res.stdout);
    expect(parsed.slug).toBe('alex-smith');
    expect(parsed.path).toContain('alex-smith.md');
  });

  it('missing required --name returns non-zero and writes to stderr', () => {
    const res = run([
      'target', 'add',
      '--config', configPath,
      '--company', 'Vercel',
      '--role', 'HoE',
      '--linkedin', 'https://linkedin.com/in/alex',
    ]);
    expect(res.status).not.toBe(0);
    // commander writes "error: required option '--name <name>' not specified" to stderr
    expect(res.stderr.toLowerCase()).toContain('name');
  });

  it('invalid LinkedIn URL returns non-zero with clear message', () => {
    const res = run([
      'target', 'add',
      '--config', configPath,
      '--name', 'Alex',
      '--company', 'Vercel',
      '--role', 'HoE',
      '--linkedin', 'not-a-url',
    ]);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain('linkedin must be a valid URL');
  });
});

describe('CLI smoke: target list', () => {
  it('returns empty result when no targets', () => {
    const res = run(['target', 'list', '--config', configPath]);
    expect(res.status).toBe(0);
    const parsed = JSON.parse(res.stdout);
    expect(parsed.targets).toEqual([]);
    expect(parsed.skipped).toEqual([]);
  });

  it('returns targets in structured result', () => {
    run([
      'target', 'add',
      '--config', configPath,
      '--name', 'Alex',
      '--company', 'Vercel',
      '--role', 'HoE',
      '--linkedin', 'https://linkedin.com/in/alex',
    ]);
    const res = run(['target', 'list', '--config', configPath]);
    expect(res.status).toBe(0);
    const parsed = JSON.parse(res.stdout);
    expect(parsed.targets).toHaveLength(1);
    expect(parsed.targets[0].slug).toBe('alex');
  });

  it('exits non-zero and warns on stderr when a target file is corrupted', () => {
    run([
      'target', 'add',
      '--config', configPath,
      '--name', 'Alex',
      '--company', 'Vercel',
      '--role', 'HoE',
      '--linkedin', 'https://linkedin.com/in/alex',
    ]);
    // Write a broken target file
    writeFileSync(join(vault, 'targets', 'broken.md'), '---\nnot-a: valid-schema\n---\n# Broken\n');
    const res = run(['target', 'list', '--config', configPath]);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain('skipped');
    const parsed = JSON.parse(res.stdout);
    expect(parsed.targets).toHaveLength(1);
    expect(parsed.skipped).toHaveLength(1);
  });
});

describe('CLI smoke: target log + review', () => {
  it('logs engagement, then review puts target in ready_to_connect', () => {
    run([
      'target', 'add',
      '--config', configPath,
      '--name', 'Alex',
      '--company', 'Vercel',
      '--role', 'HoE',
      '--linkedin', 'https://linkedin.com/in/alex',
    ]);
    const logRes = run([
      'target', 'log',
      '--config', configPath,
      '--slug', 'alex',
      '--action', 'Commented on their post',
      '--date', '2026-04-13',
    ]);
    expect(logRes.status).toBe(0);

    const reviewRes = run([
      'target', 'review',
      '--config', configPath,
      '--today', '2026-04-20',
    ]);
    expect(reviewRes.status).toBe(0);
    const parsed = JSON.parse(reviewRes.stdout);
    expect(parsed.ready_to_connect).toHaveLength(1);
    expect(parsed.ready_to_connect[0].slug).toBe('alex');
  });
});

describe('CLI smoke: missing config', () => {
  it('returns non-zero with clear error when config file missing', () => {
    const res = run([
      'target', 'list',
      '--config', '/tmp/definitely-does-not-exist-' + Date.now() + '.json',
    ]);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toContain('Config not found');
  });
});
