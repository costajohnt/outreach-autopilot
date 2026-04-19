import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runTargetLog } from '../src/commands/target-log';
import { createTarget } from '../src/lib/target.js';

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
    expect(content).toMatch(/last_engagement:\s*['"]?2026-04-20['"]?/);
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
