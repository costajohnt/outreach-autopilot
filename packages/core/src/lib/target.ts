import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import matter from 'gray-matter';
import { toSlug } from './slug.js';
import { TargetFrontmatter } from '../types.js';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface NewTargetInput {
  name: string;
  company: string;
  role: string;
  linkedin_url: string;
}

export interface TargetFile {
  frontmatter: TargetFrontmatter;
  body: string;
  path: string;
}

export interface EngagementEntry {
  date: string;
  action: string;
}

export function targetPath(vault: string, slug: string): string {
  return join(vault, 'targets', `${slug}.md`);
}

export function createTarget(vault: string, input: NewTargetInput): string {
  const slug = toSlug(input.name);
  if (!slug) {
    throw new Error(`Cannot derive a valid slug from name: "${input.name}"`);
  }
  const path = targetPath(vault, slug);

  if (existsSync(path)) {
    throw new Error(`Target already exists: ${path}`);
  }

  mkdirSync(dirname(path), { recursive: true });

  const frontmatter = {
    name: input.name,
    company: input.company,
    role: input.role,
    linkedin_url: input.linkedin_url,
    status: 'researching' as const,
    first_engagement: null,
    last_engagement: null,
    connection_sent: null,
    connection_accepted: null,
    tags: [] as string[],
  };

  const body = `# ${input.name}

## Research notes

(Fill in what they care about, their recent themes, hooks for engagement.)

## Engagement log

(Entries appended here chronologically, oldest first.)
`;

  const serialized = matter.stringify(body, frontmatter);
  writeFileSync(path, serialized);
  return path;
}

export function readTarget(vault: string, slug: string): TargetFile {
  const path = targetPath(vault, slug);
  if (!existsSync(path)) {
    throw new Error(`Target not found: ${path}`);
  }
  let parsed;
  try {
    parsed = matter(readFileSync(path, 'utf-8'));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Could not parse frontmatter in ${path}: ${msg}`);
  }
  try {
    return {
      frontmatter: TargetFrontmatter.parse(parsed.data),
      body: parsed.content,
      path,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid target frontmatter in ${path}: ${msg}`);
  }
}

export function appendEngagement(
  vault: string,
  slug: string,
  entry: EngagementEntry,
): void {
  if (!ISO_DATE_RE.test(entry.date)) {
    throw new Error(`Engagement date must be YYYY-MM-DD, got: ${entry.date}`);
  }

  const target = readTarget(vault, slug);
  const marker = '## Engagement log';

  if (target.frontmatter.last_engagement && entry.date < target.frontmatter.last_engagement) {
    throw new Error(
      `Engagement date (${entry.date}) is older than last_engagement (${target.frontmatter.last_engagement}). Edit the target file manually to backfill.`,
    );
  }

  const parts = target.body.split(marker);
  if (parts.length < 2) {
    throw new Error(`Target body missing "${marker}" section: ${target.path}`);
  }

  const before = parts[0];
  const after = parts.slice(1).join(marker);
  const line = `- ${entry.date}: ${entry.action}`;

  const cleanedAfter = after
    .replace('(Entries appended here chronologically, oldest first.)', '')
    .replace('(Entries appended here chronologically.)', '')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '');

  const newSection = cleanedAfter
    ? `${marker}\n\n${cleanedAfter}\n${line}\n`
    : `${marker}\n\n${line}\n`;

  const body = `${before}${newSection}`;

  const frontmatter = { ...target.frontmatter };
  frontmatter.last_engagement = entry.date;
  if (!frontmatter.first_engagement) {
    frontmatter.first_engagement = entry.date;
  }

  const serialized = matter.stringify(body, frontmatter);
  writeFileSync(target.path, serialized);
}
