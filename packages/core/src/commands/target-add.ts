import { loadConfig } from '../lib/config.js';
import { createTarget } from '../lib/target.js';
import { toSlug } from '../lib/slug.js';

export interface TargetAddArgs {
  config: string;
  name: string;
  company: string;
  role: string;
  linkedin: string;
}

export interface TargetAddResult {
  slug: string;
  path: string;
}

export async function runTargetAdd(args: TargetAddArgs): Promise<TargetAddResult> {
  if (!args.name) throw new Error('name is required');
  if (!args.company) throw new Error('company is required');
  if (!args.role) throw new Error('role is required');
  if (!args.linkedin) throw new Error('linkedin is required');

  try {
    new URL(args.linkedin);
  } catch {
    throw new Error('linkedin must be a valid URL');
  }

  const cfg = loadConfig(args.config);

  const path = createTarget(cfg.vault_path, {
    name: args.name,
    company: args.company,
    role: args.role,
    linkedin_url: args.linkedin,
  });

  return { slug: toSlug(args.name), path };
}
