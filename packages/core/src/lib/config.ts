import { readFileSync, existsSync } from 'fs';
import { Config } from '../types';

export function loadConfig(path: string): Config {
  if (!existsSync(path)) {
    throw new Error(`Config not found: ${path}`);
  }
  const raw = readFileSync(path, 'utf-8');
  const parsed = JSON.parse(raw);
  return Config.parse(parsed);
}
