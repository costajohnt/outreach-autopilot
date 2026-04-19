import { z } from 'zod';

export const TargetStatus = z.enum([
  'researching',
  'engaged',
  'connection_sent',
  'connected',
  'warm',
  'cold',
]);
export type TargetStatus = z.infer<typeof TargetStatus>;

export const TargetFrontmatter = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  linkedin_url: z.string().url(),
  status: TargetStatus,
  first_engagement: z.string().nullable().optional(),
  last_engagement: z.string().nullable().optional(),
  connection_sent: z.string().nullable().optional(),
  connection_accepted: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});
export type TargetFrontmatter = z.infer<typeof TargetFrontmatter>;

export const Config = z.object({
  vault_path: z.string(),
  voice_samples_path: z.string(),
  voice_sample_files: z.array(z.string()).default([]),
});
export type Config = z.infer<typeof Config>;
