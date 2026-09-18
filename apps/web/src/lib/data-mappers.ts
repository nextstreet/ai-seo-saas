import type { CandidateContent, GalleryItem, ManagedContentPage, PageType, PublishedContent, QualityGate } from './types';

type Row = Record<string, unknown>;

const numberValue = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const stringArray = (value: unknown) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string')
  : [];

const objectValue = (value: unknown): Row => value && typeof value === 'object' && !Array.isArray(value)
  ? value as Row
  : {};

const pageType = (value: unknown): PageType => typeof value === 'string'
  ? value as PageType
  : 'intent_guide';

export function mapPublishedContent(row: Row): PublishedContent {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    candidateId: String(row.source_candidate_id || ''),
    slug: String(row.slug),
    pageType: pageType(row.page_type),
    primaryKeyword: String(row.primary_keyword),
    title: String(row.title),
    metaDescription: String(row.meta_description),
    heroSummary: String(row.hero_summary),
    body: Array.isArray(row.body) ? row.body as PublishedContent['body'] : [],
    internalLinks: Array.isArray(row.internal_links) ? row.internal_links as PublishedContent['internalLinks'] : [],
    publishedAt: String(row.published_at || row.updated_at || '')
  };
}

export function mapManagedContentPage(row: Row): ManagedContentPage {
  return {
    ...mapPublishedContent(row),
    status: row.status as ManagedContentPage['status'],
    primaryIntent: String(row.primary_intent || ''),
    contentVersion: numberValue(row.content_version, 1),
    updatedAt: String(row.updated_at || '')
  };
}

export function mapCandidate(row: Row): CandidateContent {
  const storedGate = objectValue(row.quality_gate);
  const uniqueness = numberValue(storedGate.uniqueness, numberValue(row.uniqueness_score));
  const cannibalizationRisk = numberValue(storedGate.cannibalizationRisk, numberValue(row.cannibalization_score));
  const qualityGate: QualityGate = {
    intentDifference: numberValue(storedGate.intentDifference, numberValue(row.information_gain_score)),
    uniqueness,
    assetReadiness: numberValue(storedGate.assetReadiness),
    cannibalizationRisk,
    buyerValue: numberValue(storedGate.buyerValue, numberValue(row.commercial_score)),
    passed: storedGate.passed === true || ['approved', 'draft', 'review', 'published'].includes(String(row.status)),
    notes: stringArray(storedGate.notes).length ? stringArray(storedGate.notes) : [String(row.reason || 'Awaiting editorial review.')]
  };

  const componentScores = [qualityGate.intentDifference, uniqueness, qualityGate.assetReadiness, qualityGate.buyerValue, 100 - cannibalizationRisk];
  const derivedQuality = Math.round(componentScores.reduce((total, score) => total + score, 0) / componentScores.length);

  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    topicId: String(row.topic_id || ''),
    slug: String(row.slug),
    pageType: pageType(row.recommended_page_type),
    primaryKeyword: String(row.primary_query),
    title: String(row.title),
    metaDescription: String(row.meta_description),
    intentSummary: String(row.intent_summary),
    outline: stringArray(row.outline),
    opportunityScore: numberValue(row.opportunity_score),
    qualityScore: numberValue(row.quality_score, derivedQuality),
    qualityGate,
    status: row.status as CandidateContent['status'],
    ...(row.existing_page_id ? { pageId: String(row.existing_page_id) } : {})
  };
}

export function mapGalleryItem(row: Row, votesCount = 0): GalleryItem {
  const attributes = objectValue(row.attributes);
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    slug: String(row.slug || row.id),
    title: String(row.name),
    imageUrl: String(attributes.imageUrl || attributes.image_url || ''),
    description: String(row.description || ''),
    tags: stringArray(attributes.tags),
    votesCount
  };
}
