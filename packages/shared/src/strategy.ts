import { z } from 'zod';

export const businessModelSchema = z.enum([
  'design_driven_custom',
  'industrial_b2b',
  'project_b2b',
  'private_label',
  'commerce',
]);

export const publishingModeSchema = z.enum([
  'manual',
  'review_required',
  'semi_automatic',
]);

export const strategyProfileSchema = z.object({
  businessModel: businessModelSchema,
  primaryChannels: z.array(z.string()).min(1),
  primaryIntents: z.array(z.string()).min(1),
  secondaryIntents: z.array(z.string()),
  lowPriorityIntents: z.array(z.string()),
  allowedPageTypes: z.array(z.string()).min(1),
  publishingMode: publishingModeSchema,
});

export type BusinessModel = z.infer<typeof businessModelSchema>;
export type PublishingMode = z.infer<typeof publishingModeSchema>;
export type StrategyProfile = z.infer<typeof strategyProfileSchema>;
