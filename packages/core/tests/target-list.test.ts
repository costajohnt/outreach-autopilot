import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runTargetList } from '../src/commands/target-list';
import { createTarget, appendEngagement } from '../src/lib/target.js';

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
  it('returns empty targets + skipped when no targets dir exists', async () => {
    const result = await runTargetList({ config: configPath });
    expect(result.targets).toEqual([]);
    expect(result.skipped).toEqual([]);
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
    expect(result.targets).toHaveLength(2);
    expect(result.skipped).toEqual([]);

    const alex = result.targets.find((t) => t.slug === 'alex-smith')!;
    expect(alex.name).toBe('Alex Smith');
    expect(alex.company).toBe('Vercel');
    expect(alex.last_engagement).toBe('2026-04-20');

    const jamie = result.targets.find((t) => t.slug === 'jamie-lee')!;
    expect(jamie.last_engagement).toBeNull();
  });

  it('skips corrupted target files and reports them in skipped array', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    writeFileSync(join(vault, 'targets', 'broken.md'), '---\nname: Broken\n---\n# Broken\n');

    const result = await runTargetList({ config: configPath });
    expect(result.targets).toHaveLength(1);
    expect(result.targets[0].slug).toBe('alex-smith');
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].file).toBe('broken.md');
    expect(result.skipped[0].reason).toContain('broken.md');
  });
});
