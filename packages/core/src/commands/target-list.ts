import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { loadConfig } from '../lib/config.js';
import { readTarget } from '../lib/target.js';
import { TargetStatus } from '../types.js';

export interface TargetListArgs {
  config: string;
}

export interface TargetSummary {
  slug: string;
  name: string;
  company: string;
  role: string;
  status: TargetStatus;
  first_engagement: string | null;
  last_engagement: string | null;
  connection_sent: string | null;
  connection_accepted: string | null;
}

export async function runTargetList(args: TargetListArgs): Promise<TargetSummary[]> {
  const cfg = loadConfig(args.config);
  const targetsDir = join(cfg.vault_path, 'targets');
  if (!existsSync(targetsDir)) return [];

  const files = readdirSync(targetsDir).filter((f) => f.endsWith('.md'));

  const summaries: TargetSummary[] = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    try {
      const target = readTarget(cfg.vault_path, slug);
      const fm = target.frontmatter;
      summaries.push({
        slug,
        name: fm.name,
        company: fm.company,
        role: fm.role,
        status: fm.status,
        first_engagement: fm.first_engagement ?? null,
        last_engagement: fm.last_engagement ?? null,
        connection_sent: fm.connection_sent ?? null,
        connection_accepted: fm.connection_accepted ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Skipping ${file}: ${msg}`);
    }
  }
  return summaries;
}
