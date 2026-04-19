import { readFileSync, existsSync, statSync } from 'fs';
import { isAbsolute, resolve, normalize } from 'path';
import { Config } from '../types.js';

export function loadConfig(path: string): Config {
  if (!existsSync(path)) {
    throw new Error(`Config not found: ${path}`);
  }
  if (!statSync(path).isFile()) {
    throw new Error(`Config path is not a file: ${path}`);
  }
  const raw = readFileSync(path, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Config is not valid JSON (${path}): ${msg}`);
  }
  const cfg = Config.parse(parsed);

  if (!isAbsolute(cfg.vault_path)) {
    throw new Error(`Config vault_path must be an absolute path: ${cfg.vault_path}`);
  }
  if (!isAbsolute(cfg.voice_samples_path)) {
    throw new Error(`Config voice_samples_path must be an absolute path: ${cfg.voice_samples_path}`);
  }

  return {
    ...cfg,
    vault_path: normalize(resolve(cfg.vault_path)),
    voice_samples_path: normalize(resolve(cfg.voice_samples_path)),
  };
}
