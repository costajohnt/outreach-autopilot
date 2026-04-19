import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
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
  it('loads specified sample files and returns empty missing array', () => {
    writeFileSync(join(tmp, 'a.md'), '# Post A\n\nContent A.');
    writeFileSync(join(tmp, 'b.md'), '# Post B\n\nContent B.');
    const result = loadVoiceSamples(tmp, ['a.md', 'b.md']);
    expect(result.samples).toHaveLength(2);
    expect(result.samples[0].filename).toBe('a.md');
    expect(result.samples[0].content).toContain('Content A');
    expect(result.missing).toEqual([]);
  });

  it('returns missing filenames for files that do not exist', () => {
    writeFileSync(join(tmp, 'a.md'), '# Post A');
    const result = loadVoiceSamples(tmp, ['a.md', 'missing.md']);
    expect(result.samples).toHaveLength(1);
    expect(result.samples[0].filename).toBe('a.md');
    expect(result.missing).toEqual(['missing.md']);
  });

  it('returns empty samples and empty missing when no files listed', () => {
    const result = loadVoiceSamples(tmp, []);
    expect(result.samples).toEqual([]);
    expect(result.missing).toEqual([]);
  });
});
