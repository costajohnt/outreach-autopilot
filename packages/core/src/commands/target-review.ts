import { runTargetList, TargetSummary } from './target-list.js';

export interface TargetReviewArgs {
  config: string;
  today?: string;
}

export interface TargetReview {
  needs_first_engagement: TargetSummary[];
  needs_reengagement: TargetSummary[];
  ready_to_connect: TargetSummary[];
  connection_pending: TargetSummary[];
}

function daysBetween(a: string, b: string): number {
  const aMs = new Date(a).getTime();
  const bMs = new Date(b).getTime();
  if (Number.isNaN(aMs) || Number.isNaN(bMs)) {
    throw new Error(`Invalid date in daysBetween: a="${a}", b="${b}"`);
  }
  return Math.floor((bMs - aMs) / (1000 * 60 * 60 * 24));
}

export async function runTargetReview(args: TargetReviewArgs): Promise<TargetReview> {
  const targets = await runTargetList({ config: args.config });
  const today = args.today ?? new Date().toISOString().slice(0, 10);

  const needs_first_engagement = targets.filter(
    (t) => t.first_engagement === null && t.connection_sent === null,
  );

  const needs_reengagement = targets.filter(
    (t) =>
      t.last_engagement !== null &&
      t.connection_sent === null &&
      daysBetween(t.last_engagement, today) > 10,
  );

  const ready_to_connect = targets.filter(
    (t) =>
      t.last_engagement !== null &&
      t.connection_sent === null &&
      daysBetween(t.last_engagement, today) >= 7 &&
      daysBetween(t.last_engagement, today) <= 10,
  );

  const connection_pending = targets.filter(
    (t) => t.connection_sent !== null && t.connection_accepted === null,
  );

  return {
    needs_first_engagement,
    needs_reengagement,
    ready_to_connect,
    connection_pending,
  };
}
