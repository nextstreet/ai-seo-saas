import { z } from 'zod';

export const topicSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  entityType: z.string().min(1),
  description: z.string().optional(),
});

export const topicRelationSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  sourceTopicId: z.string().min(1),
  targetTopicId: z.string().min(1),
  relationType: z.string().min(1),
  weight: z.number().min(0).max(100).default(1),
});

export type Topic = z.infer<typeof topicSchema>;
export type TopicRelation = z.infer<typeof topicRelationSchema>;
