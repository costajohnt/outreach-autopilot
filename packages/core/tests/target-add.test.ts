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

  it('throws if company is missing', async () => {
    await expect(runTargetAdd({
      config: configPath,
      name: 'Alex',
      company: '',
      role: 'HoE',
      linkedin: 'https://linkedin.com/in/alex',
    })).rejects.toThrow(/company/);
  });

  it('throws if role is missing', async () => {
    await expect(runTargetAdd({
      config: configPath,
      name: 'Alex',
      company: 'Vercel',
      role: '',
      linkedin: 'https://linkedin.com/in/alex',
    })).rejects.toThrow(/role/);
  });

  it('throws if linkedin is missing', async () => {
    await expect(runTargetAdd({
      config: configPath,
      name: 'Alex',
      company: 'Vercel',
      role: 'HoE',
      linkedin: '',
    })).rejects.toThrow(/linkedin/);
  });

  it('throws if linkedin URL is invalid', async () => {
    await expect(runTargetAdd({
      config: configPath,
      name: 'Alex',
      company: 'Vercel',
      role: 'HoE',
      linkedin: 'not-a-url',
    })).rejects.toThrow();
  });
});
