import { loadConfig } from '../lib/config.js';
import { loadVoiceSamples } from '../lib/voice.js';

export interface VoiceSamplesArgs {
  config: string;
}

export interface VoiceSamplesResult {
  samples: Array<{ filename: string; content: string }>;
  missing: string[];
}

export async function runVoiceSamples(args: VoiceSamplesArgs): Promise<VoiceSamplesResult> {
  const cfg = loadConfig(args.config);
  const result = loadVoiceSamples(cfg.voice_samples_path, cfg.voice_sample_files);
  if (result.missing.length > 0) {
    throw new Error(
      `Voice samples not found under ${cfg.voice_samples_path}: ${result.missing.join(', ')}. Check config.`,
    );
  }
  return { samples: result.samples, missing: [] };
}
