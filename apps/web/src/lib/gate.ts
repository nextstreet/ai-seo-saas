import type { CandidateContent, PageType, QualityGate, Topic } from './types';

type CandidateInput = {
  id: string;
  tenantId: string;
  topic: Topic;
  slug: string;
  pageType: PageType;
  primaryKeyword: string;
  title: string;
  metaDescription: string;
  intentSummary: string;
  outline: string[];
  searchDemand: number;
  commercialValue: number;
  originalAssets: number;
  existingCoverage: number;
};

const pageTypeWeights: Record<PageType, number> = {
  product: 13,
  design_inspiration: 9,
  material_guide: 8,
  intent_guide: 8,
  comparison: 10,
  gallery: 7,
  community_topic: 6
};

export function buildQualityGate(input: CandidateInput): QualityGate {
  const intentDifference = Math.min(100, 52 + input.topic.searchIntents.length * 9 + pageTypeWeights[input.pageType]);
  const uniqueness = Math.min(100, 48 + input.outline.length * 7 + input.originalAssets * 4);
  const assetReadiness = Math.min(100, 35 + input.originalAssets * 15);
  const cannibalizationRisk = Math.max(0, 72 - input.existingCoverage * 12 - input.topic.priority / 4);
  const buyerValue = Math.min(100, 42 + input.commercialValue * 8 + (input.pageType === 'product' ? 10 : 0));

  const passed =
    intentDifference >= 65 &&
    uniqueness >= 70 &&
    assetReadiness >= 50 &&
    cannibalizationRisk <= 55 &&
    buyerValue >= 65;

  const notes = [
    intentDifference >= 65 ? 'Intent is distinct enough for a standalone page.' : 'Merge into an existing hub until the search intent is clearer.',
    uniqueness >= 70 ? 'Outline has enough page-specific sections.' : 'Needs more original angles before approval.',
    assetReadiness >= 50 ? 'Visual or community assets are sufficient for V1.' : 'Add images, votes, or examples before publishing.',
    cannibalizationRisk <= 55 ? 'Cannibalization risk is acceptable.' : 'Likely overlaps an existing page.',
    buyerValue >= 65 ? 'Commercial or practical buyer value is visible.' : 'Needs stronger decision-making value.'
  ];

  return {
    intentDifference,
    uniqueness,
    assetReadiness,
    cannibalizationRisk,
    buyerValue,
    passed,
    notes
  };
}

export function scoreCandidate(input: CandidateInput): CandidateContent {
  const qualityGate = buildQualityGate(input);
  const opportunityScore = Math.round(
    input.searchDemand * 0.32 +
      input.commercialValue * 8 +
      input.originalAssets * 5 +
      input.topic.priority * 0.18 +
      pageTypeWeights[input.pageType]
  );
  const qualityScore = Math.round(
    (qualityGate.intentDifference + qualityGate.uniqueness + qualityGate.assetReadiness + qualityGate.buyerValue + (100 - qualityGate.cannibalizationRisk)) / 5
  );

  return {
    id: input.id,
    tenantId: input.tenantId,
    topicId: input.topic.id,
    slug: input.slug,
    pageType: input.pageType,
    primaryKeyword: input.primaryKeyword,
    title: input.title,
    metaDescription: input.metaDescription,
    intentSummary: input.intentSummary,
    outline: input.outline,
    opportunityScore,
    qualityScore,
    qualityGate,
    status: qualityGate.passed ? 'approved' : 'candidate'
  };
}
