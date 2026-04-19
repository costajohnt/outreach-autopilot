import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runTargetReview } from '../src/commands/target-review';
import { createTarget, appendEngagement } from '../src/lib/target.js';

let tmp: string;
let vault: string;
let configPath: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'oa-'));
  vault = join(tmp, 'vault');
  configPath = join(tmp, 'config.json');
  writeFileSync(configPath, JSON.stringify({
    vault_path: vault,
    voice_samples_path: '/voice',
  }));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('runTargetReview', () => {
  it('flags targets with no engagement as "needs first engagement"', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.needs_first_engagement).toHaveLength(1);
    expect(review.needs_first_engagement[0].slug).toBe('alex-smith');
  });

  it('flags targets engaged >10 days ago as "needs re-engagement"', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-01', action: 'Commented' });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.needs_reengagement).toHaveLength(1);
    expect(review.needs_reengagement[0].slug).toBe('alex-smith');
  });

  it('flags targets ready for connection request (engaged 7-10 days, no connection sent)', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-12', action: 'Commented' });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.ready_to_connect).toHaveLength(1);
    expect(review.ready_to_connect[0].slug).toBe('alex-smith');
  });

  it('boundary: day 7 since engagement → ready_to_connect', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-13', action: 'Commented' });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.ready_to_connect).toHaveLength(1);
    expect(review.needs_reengagement).toHaveLength(0);
  });

  it('boundary: day 10 since engagement → ready_to_connect', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-10', action: 'Commented' });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.ready_to_connect).toHaveLength(1);
    expect(review.needs_reengagement).toHaveLength(0);
  });

  it('boundary: day 11 since engagement → needs_reengagement', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-09', action: 'Commented' });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.ready_to_connect).toHaveLength(0);
    expect(review.needs_reengagement).toHaveLength(1);
  });

  it('days 1-6 after engagement: target is neither ready nor needs_reengagement', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-17', action: 'Commented' });
    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.ready_to_connect).toHaveLength(0);
    expect(review.needs_reengagement).toHaveLength(0);
    expect(review.needs_first_engagement).toHaveLength(0);
  });

  it('does not re-flag targets with connection already sent', async () => {
    createTarget(vault, {
      name: 'Alex Smith',
      company: 'Vercel',
      role: 'HoE',
      linkedin_url: 'https://linkedin.com/in/alex',
    });
    appendEngagement(vault, 'alex-smith', { date: '2026-04-12', action: 'Commented' });

    const path = join(vault, 'targets', 'alex-smith.md');
    const content = readFileSync(path, 'utf-8');
    const updated = content.replace(
      'connection_sent: null',
      `connection_sent: '2026-04-15'`,
    );
    writeFileSync(path, updated);

    const review = await runTargetReview({ config: configPath, today: '2026-04-20' });
    expect(review.ready_to_connect).toHaveLength(0);
    expect(review.connection_pending).toHaveLength(1);
  });
});
