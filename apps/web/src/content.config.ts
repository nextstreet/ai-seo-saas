import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const breadcrumbSchema = z.object({
  href: z.string().startsWith('/'),
  label: z.string().min(1),
});

const commonPageSchema = z.object({
  title: z.string().min(20).max(70),
  description: z.string().min(70).max(170),
  canonicalPath: z.string().startsWith('/'),
  primaryTopic: z.string().min(1),
  topicId: z.string().min(1),
  relatedTopicIds: z.array(z.string().min(1)).min(1),
  primaryIntent: z.string().min(1),
  reviewed: z.literal(true),
  publishedAt: z.coerce.date(),
  breadcrumbs: z.array(breadcrumbSchema).min(2),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: z.discriminatedUnion('pageType', [
    commonPageSchema.extend({
      pageType: z.literal('customization'),
      options: z.array(z.object({ label: z.string(), detail: z.string() })).min(2),
      process: z.array(z.string()).min(3),
    }),
    commonPageSchema.extend({
      pageType: z.literal('guide'),
      steps: z.array(z.object({ name: z.string(), text: z.string() })).min(3),
    }),
  ]),
});

export const collections = { pages };
