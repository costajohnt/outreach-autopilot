import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runVoiceSamples } from '../src/commands/voice-samples';

let tmp: string;
let voicePath: string;
let configPath: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'oa-'));
  voicePath = join(tmp, 'voice');
  mkdirSync(voicePath, { recursive: true });
  configPath = join(tmp, 'config.json');
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('runVoiceSamples', () => {
  it('returns all samples when all files present', async () => {
    writeFileSync(join(voicePath, 'a.md'), '# A\nContent');
    writeFileSync(configPath, JSON.stringify({
      vault_path: '/vault',
      voice_samples_path: voicePath,
      voice_sample_files: ['a.md'],
    }));
    const result = await runVoiceSamples({ config: configPath });
    expect(result.samples).toHaveLength(1);
    expect(result.samples[0].filename).toBe('a.md');
  });

  it('throws with specific missing filenames', async () => {
    writeFileSync(configPath, JSON.stringify({
      vault_path: '/vault',
      voice_samples_path: voicePath,
      voice_sample_files: ['missing.md', 'also-missing.md'],
    }));
    await expect(runVoiceSamples({ config: configPath })).rejects.toThrow(/missing\.md.*also-missing\.md/);
  });
});
