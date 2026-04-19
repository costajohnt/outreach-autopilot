import { describe, it, expect } from 'vitest';
import { toSlug } from '../src/lib/slug';

describe('toSlug', () => {
  it('lowercases and kebab-cases simple names', () => {
    expect(toSlug('Alex Smith')).toBe('alex-smith');
  });

  it('handles multiple spaces', () => {
    expect(toSlug('Alex   Smith')).toBe('alex-smith');
  });

  it('strips diacritics', () => {
    expect(toSlug('Álex Ñoño')).toBe('alex-nono');
  });

  it('strips punctuation', () => {
    expect(toSlug('Alex J. Smith')).toBe('alex-j-smith');
  });

  it('trims leading and trailing dashes', () => {
    expect(toSlug('  -alex-  ')).toBe('alex');
  });

  it('collapses runs of dashes', () => {
    expect(toSlug('alex---smith')).toBe('alex-smith');
  });
});
