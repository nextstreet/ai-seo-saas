import type { PageType } from '@ai-seo/shared';

export interface BriefInput {
  tenantId: string;
  primaryTopic: string;
  primaryIntent: string;
  pageType: PageType;
  facts: string[];
  relatedTopics: string[];
}

export interface ContentBrief extends BriefInput {
  objective: string;
  requiredSections: string[];
  reviewRequired: true;
}

const sectionsByPageType: Partial<Record<PageType, string[]>> = {
  commercial: ['Value proposition', 'Options', 'MOQ and sample', 'Lead time', 'CTA'],
  product: ['Product fit', 'Features', 'Options', 'Use cases', 'CTA'],
  customization: ['Customization choices', 'Constraints', 'Process', 'Examples', 'CTA'],
  guide: ['Problem definition', 'Step-by-step guidance', 'Examples', 'Related topics'],
  comparison: ['Evaluation criteria', 'Differences', 'Best fit', 'Limitations', 'Conclusion'],
  design_inspiration: ['Visual concept', 'Style notes', 'Variations', 'Related designs', 'Vote'],
  gallery: ['Theme', 'Curated designs', 'Selection criteria', 'Related collections'],
};

const fallbackSections = ['User need', 'Key facts', 'Useful explanation', 'Related topics', 'Next step'];

export function buildBrief(input: BriefInput): ContentBrief {
  return {
    ...input,
    objective: `Satisfy the ${input.primaryIntent} intent for ${input.primaryTopic} with a ${input.pageType} page.`,
    requiredSections: sectionsByPageType[input.pageType] ?? fallbackSections,
    reviewRequired: true,
  };
}
