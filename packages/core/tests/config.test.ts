import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
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

  it('throws with clear message on invalid JSON', () => {
    const configPath = join(tmp, 'config.json');
    writeFileSync(configPath, '{ not valid json }');
    expect(() => loadConfig(configPath)).toThrow(/not valid JSON/);
  });

  it('throws if path is a directory', () => {
    const dirPath = join(tmp, 'not-a-file');
    mkdirSync(dirPath);
    expect(() => loadConfig(dirPath)).toThrow(/not a file/);
  });

  it('throws when vault_path is relative', () => {
    const configPath = join(tmp, 'config.json');
    writeFileSync(configPath, JSON.stringify({
      vault_path: 'relative/path',
      voice_samples_path: '/abs/path',
    }));
    expect(() => loadConfig(configPath)).toThrow(/vault_path must be an absolute path/);
  });

  it('throws when voice_samples_path is relative', () => {
    const configPath = join(tmp, 'config.json');
    writeFileSync(configPath, JSON.stringify({
      vault_path: '/abs/path',
      voice_samples_path: 'relative/path',
    }));
    expect(() => loadConfig(configPath)).toThrow(/voice_samples_path must be an absolute path/);
  });

  it('normalizes path with traversal segments', () => {
    const configPath = join(tmp, 'config.json');
    writeFileSync(configPath, JSON.stringify({
      vault_path: '/tmp/a/b/../c',
      voice_samples_path: '/tmp/x/y/../z',
    }));
    const cfg = loadConfig(configPath);
    expect(cfg.vault_path).toBe('/tmp/a/c');
    expect(cfg.voice_samples_path).toBe('/tmp/x/z');
  });
});
