import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

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
  const resolvedBase = resolve(basePath);
  const samples: VoiceSample[] = [];
  const missing: string[] = [];

  for (const filename of filenames) {
    const resolvedPath = resolve(resolvedBase, filename);
    // Containment check: resolved path must be inside the base directory
    if (
      resolvedPath !== resolvedBase &&
      !resolvedPath.startsWith(resolvedBase + '/') &&
      !resolvedPath.startsWith(resolvedBase + '\\') // Windows
    ) {
      throw new Error(
        `Voice sample filename escapes voice_samples_path: ${filename} (resolved to ${resolvedPath}, must be inside ${resolvedBase})`,
      );
    }
    if (!existsSync(resolvedPath)) {
      missing.push(filename);
      continue;
    }
    samples.push({ filename, content: readFileSync(resolvedPath, 'utf-8') });
  }
  return { samples, missing };
}
