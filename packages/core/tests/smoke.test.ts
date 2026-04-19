import { describe, it, expect } from 'vitest';
import { TargetFrontmatter } from '../src/types';

describe('smoke', () => {
  it('zod schema parses a valid target', () => {
    const input = {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'Head of Engineering',
      linkedin_url: 'https://linkedin.com/in/alexsmith',
      status: 'researching',
      tags: ['dev-tools'],
    };
    const result = TargetFrontmatter.parse(input);
    expect(result.name).toBe('Alex Smith');
  });
});
