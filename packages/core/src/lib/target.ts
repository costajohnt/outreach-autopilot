import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { toSlug } from './slug.js';
import { TargetFrontmatter } from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = resolve(__dirname, '../../../../templates/target.md');

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

  const template = readFileSync(TEMPLATE_PATH, 'utf-8');
  const rendered = template
    .replaceAll('{{name}}', input.name)
    .replaceAll('{{company}}', input.company)
    .replaceAll('{{role}}', input.role)
    .replaceAll('{{linkedin_url}}', input.linkedin_url);

  writeFileSync(path, rendered);
  return path;
}

export function readTarget(vault: string, slug: string): TargetFile {
  const path = targetPath(vault, slug);
  if (!existsSync(path)) {
    throw new Error(`Target not found: ${path}`);
  }
  const parsed = matter(readFileSync(path, 'utf-8'));
  return {
    frontmatter: TargetFrontmatter.parse(parsed.data),
    body: parsed.content,
    path,
  };
}

export function appendEngagement(
  vault: string,
  slug: string,
  entry: EngagementEntry,
): void {
  const target = readTarget(vault, slug);
  const marker = '## Engagement log';

  const parts = target.body.split(marker);
  if (parts.length < 2) {
    throw new Error(`Target body missing "${marker}" section: ${target.path}`);
  }

  const before = parts[0];
  const after = parts.slice(1).join(marker);
  const line = `- ${entry.date}: ${entry.action}`;

  const cleanedAfter = after
    .replace('(Entries appended here chronologically.)', '')
    .replace(/^\s+/, '')
    .replace(/\s+$/, '');

  const newSection = cleanedAfter
    ? `${marker}\n\n${line}\n\n${cleanedAfter}\n`
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
