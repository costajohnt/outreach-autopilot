import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import matter from 'gray-matter';
import { toSlug } from './slug';
import { TargetFrontmatter } from '../types';

const TEMPLATE_PATH = new URL('../../../../templates/target.md', import.meta.url).pathname;

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
  const line = `- ${entry.date}: ${entry.action}`;

  let body = target.body;
  const marker = '## Engagement log';
  if (body.includes(marker)) {
    body = body.replace(
      marker,
      `${marker}\n\n${line}`,
    );
    body = body.replace(
      `${marker}\n\n${line}\n\n(Entries appended here chronologically.)`,
      `${marker}\n\n${line}`,
    );
  } else {
    body += `\n\n## Engagement log\n\n${line}\n`;
  }

  const frontmatter = { ...target.frontmatter };
  frontmatter.last_engagement = entry.date;
  if (!frontmatter.first_engagement) {
    frontmatter.first_engagement = entry.date;
  }

  const serialized = matter.stringify(body, frontmatter);
  writeFileSync(target.path, serialized);
}
