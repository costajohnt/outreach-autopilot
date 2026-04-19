import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface VoiceSample {
  filename: string;
  content: string;
}

export function loadVoiceSamples(
  basePath: string,
  filenames: string[],
): VoiceSample[] {
  return filenames
    .map((filename) => {
      const path = join(basePath, filename);
      if (!existsSync(path)) return null;
      return { filename, content: readFileSync(path, 'utf-8') };
    })
    .filter((s): s is VoiceSample => s !== null);
}
