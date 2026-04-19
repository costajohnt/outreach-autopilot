import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface VoiceSample {
  filename: string;
  content: string;
}

export interface VoiceLoadResult {
  samples: VoiceSample[];
  missing: string[];
}

export function loadVoiceSamples(
  basePath: string,
  filenames: string[],
): VoiceLoadResult {
  const samples: VoiceSample[] = [];
  const missing: string[] = [];
  for (const filename of filenames) {
    const path = join(basePath, filename);
    if (!existsSync(path)) {
      missing.push(filename);
      continue;
    }
    samples.push({ filename, content: readFileSync(path, 'utf-8') });
  }
  return { samples, missing };
}
