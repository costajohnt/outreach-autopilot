import { readFileSync, existsSync, statSync } from 'fs';
import { Config } from '../types';

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
  return Config.parse(parsed);
}
