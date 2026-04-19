import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import matter from 'gray-matter';
import { createTarget, readTarget, appendEngagement, targetPath } from '../src/lib/target';

let vault: string;

beforeEach(() => {
  vault = mkdtempSync(join(tmpdir(), 'oa-vault-'));
});

afterEach(() => {
  rmSync(vault, { recursive: true, force: true });
});

describe('createTarget', () => {
  it('creates a target file with correct frontmatter', () => {
    const path = createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    expect(existsSync(path)).toBe(true);
    const parsed = matter(readFileSync(path, 'utf-8'));
    expect(parsed.data.name).toBe('Alex Smith');
    expect(parsed.data.status).toBe('researching');
    expect(parsed.data.tags).toEqual([]);
  });

  it('writes file under targets/<slug>.md', () => {
    const path = createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    expect(path).toBe(join(vault, 'targets', 'alex-smith.md'));
  });

  it('throws when name has no slug-safe characters', () => {
    expect(() => createTarget(vault, {
      name: '!!!',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    })).toThrow(/slug/);
  });

  it('handles names with double quotes correctly', () => {
    createTarget(vault, {
      name: 'Bob "The Builder"',
      company: 'Acme "Inc"',
      role: 'VP of Stuff',
      linkedin_url: 'https://linkedin.com/in/bob',
    });
    // Verify the written file is readable (valid YAML)
    const target = readTarget(vault, 'bob-the-builder');
    expect(target.frontmatter.name).toBe('Bob "The Builder"');
    expect(target.frontmatter.company).toBe('Acme "Inc"');
  });

  it('handles names with special characters correctly', () => {
    createTarget(vault, {
      name: "O'Brien & Sons",
      company: 'Big $ Money',
      role: 'CEO',
      linkedin_url: 'https://linkedin.com/in/obrien',
    });
    const target = readTarget(vault, 'o-brien-sons');
    expect(target.frontmatter.name).toBe("O'Brien & Sons");
    expect(target.frontmatter.company).toBe('Big $ Money');
  });

  it('throws if target already exists', () => {
    const input = {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    };
    createTarget(vault, input);
    expect(() => createTarget(vault, input)).toThrow(/already exists/);
  });
});

describe('readTarget', () => {
  it('reads a target file and returns parsed frontmatter + body', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    const target = readTarget(vault, 'alex-smith');
    expect(target.frontmatter.name).toBe('Alex Smith');
    expect(target.body).toContain('# Alex Smith');
  });

  it('throws if target does not exist', () => {
    expect(() => readTarget(vault, 'missing')).toThrow(/not found/);
  });
});

describe('appendEngagement', () => {
  it('appends an entry under "Engagement log" section', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    appendEngagement(vault, 'alex-smith', {
      date: '2026-04-20',
      action: 'Commented on their post about TanStack Query',
    });
    const target = readTarget(vault, 'alex-smith');
    expect(target.body).toContain('- 2026-04-20: Commented on their post about TanStack Query');
  });

  it('updates last_engagement date in frontmatter', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    appendEngagement(vault, 'alex-smith', {
      date: '2026-04-20',
      action: 'Commented',
    });
    const target = readTarget(vault, 'alex-smith');
    expect(target.frontmatter.last_engagement).toBe('2026-04-20');
  });

  it('throws on non-ISO date', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    expect(() => appendEngagement(vault, 'alex-smith', {
      date: '04/20/2026',
      action: 'Commented',
    })).toThrow(/YYYY-MM-DD/);
  });

  it('sets first_engagement when empty, keeps it on subsequent entries', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-20', action: 'First' });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-25', action: 'Second' });
    const target = readTarget(vault, 'alex-smith');
    expect(target.frontmatter.first_engagement).toBe('2026-04-20');
    expect(target.frontmatter.last_engagement).toBe('2026-04-25');
  });

  it('rejects engagement dated before last_engagement', () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-20', action: 'First' });
    expect(() => appendEngagement(vault, 'alex-smith', {
      date: '2026-04-15',
      action: 'Backdated',
    })).toThrow(/older than last_engagement/);
  });
});

describe('targetPath', () => {
  it('returns targets/<slug>.md under vault', () => {
    expect(targetPath('/vault', 'alex-smith')).toBe('/vault/targets/alex-smith.md');
  });
});
