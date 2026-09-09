import { z } from 'zod';

export const pageTypeSchema = z.enum([
  'category',
  'commercial',
  'product',
  'customization',
  'component',
  'material',
  'application',
  'design_inspiration',
  'comparison',
  'guide',
  'gallery',
  'community_topic',
]);

export const candidateStatusSchema = z.enum([
  'idea',
  'candidate',
  'approved',
  'draft',
  'review',
  'published',
  'refresh',
  'archived',
]);

export const opportunityActionSchema = z.enum(['CREATE', 'EXPAND', 'MERGE', 'IGNORE']);

export type PageType = z.infer<typeof pageTypeSchema>;
export type CandidateStatus = z.infer<typeof candidateStatusSchema>;
export type OpportunityAction = z.infer<typeof opportunityActionSchema>;
