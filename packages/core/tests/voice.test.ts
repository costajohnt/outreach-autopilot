import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadVoiceSamples } from '../src/lib/voice.js';

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
