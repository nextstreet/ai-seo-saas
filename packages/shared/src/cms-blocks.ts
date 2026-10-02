import { z } from 'zod';

const requiredLabel = z.string().trim().min(1);
const safeLink = requiredLabel.refine(
  (value) => /^(?:\/|https?:\/\/|mailto:|tel:)/.test(value),
  'URL must be an internal path or use http, https, mailto, or tel.',
);

const optionRowSchema = z.object({
  label: requiredLabel,
  detail: z.string().trim().min(1),
});

const stepRowSchema = z.object({
  name: requiredLabel,
  text: z.string().trim().min(1),
});

const faqRowSchema = z.object({
  question: requiredLabel,
  answer: z.string().trim().min(1),
});

const comparisonRowSchema = z.object({
  dimension: requiredLabel,
  difference: z.string().trim().min(1),
});

const atLeastOne = <T extends z.ZodTypeAny>(schema: z.ZodArray<T>) => schema.min(1);

/**
 * Discriminated contract for CMS content blocks. Each block type maps to one
 * renderer component and (optionally) a JSON-LD node.
 */
export const cmsBlockSchema = z.discriminatedUnion('blockType', [
  z.object({
    blockType: z.literal('heading'),
    heading: requiredLabel,
  }),
  z.object({
    blockType: z.literal('text'),
    body: z.string(),
  }),
  z.object({
    blockType: z.literal('options'),
    items: atLeastOne(z.array(optionRowSchema)),
  }),
  z.object({
    blockType: z.literal('steps'),
    items: atLeastOne(z.array(stepRowSchema)),
  }),
  z.object({
    blockType: z.literal('faq'),
    items: atLeastOne(z.array(faqRowSchema)),
  }),
  z.object({
    blockType: z.literal('comparison'),
    heading: z.string().trim().min(1).optional(),
    items: atLeastOne(z.array(comparisonRowSchema)),
  }),
  z.object({
    blockType: z.literal('cta'),
    heading: z.string().trim().min(1).optional(),
    body: z.string().optional(),
    ctaLabel: requiredLabel,
    ctaUrl: safeLink,
  }),
]);

export type CmsBlock = z.infer<typeof cmsBlockSchema>;
export type CmsOptionRow = z.infer<typeof optionRowSchema>;
export type CmsStepRow = z.infer<typeof stepRowSchema>;
export type CmsFaqRow = z.infer<typeof faqRowSchema>;
export type CmsComparisonRow = z.infer<typeof comparisonRowSchema>;

type RawBlock = {
  block_type?: unknown;
  heading?: unknown;
  body?: unknown;
  items?: unknown;
  cta_label?: unknown;
  cta_url?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/**
 * Normalize a Directus cms_blocks row (snake_case, permissive) into the typed
 * contract. Throws on the first invalid block so an editorial mistake fails
 * the build instead of silently rendering malformed content.
 */
export function normalizeCmsBlock(raw: unknown, sourceId: string): CmsBlock {
  const row = asRecord(raw);
  if (!row) throw new Error(`CMS block ${sourceId} is not an object.`);

  const block = {
    blockType: (row as RawBlock).block_type,
    heading: (row as RawBlock).heading,
    body: (row as RawBlock).body,
    items: (row as RawBlock).items,
    ctaLabel: (row as RawBlock).cta_label,
    ctaUrl: (row as RawBlock).cta_url,
  };

  const result = cmsBlockSchema.safeParse(block);
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`CMS block ${sourceId} (${String(block.blockType)}) failed validation: ${detail}`);
  }
  return result.data;
}
