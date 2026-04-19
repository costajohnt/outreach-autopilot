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
