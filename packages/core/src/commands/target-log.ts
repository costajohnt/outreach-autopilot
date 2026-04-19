import { loadConfig } from '../lib/config.js';
import { appendEngagement } from '../lib/target.js';

export interface TargetLogArgs {
  config: string;
  slug: string;
  action: string;
  date?: string;
}

export async function runTargetLog(args: TargetLogArgs): Promise<void> {
  if (!args.slug) throw new Error('slug is required');
  if (!args.action) throw new Error('action is required');

  const cfg = loadConfig(args.config);
  const date = args.date ?? new Date().toISOString().slice(0, 10);

  appendEngagement(cfg.vault_path, args.slug, { date, action: args.action });
}
