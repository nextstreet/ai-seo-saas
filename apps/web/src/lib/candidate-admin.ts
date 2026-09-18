import type { CandidateContent, PageType, QualityGate } from './types';

export const pageTypes: PageType[] = ['product', 'design_inspiration', 'material_guide', 'intent_guide', 'comparison', 'gallery', 'community_topic'];
export const candidateStatuses: CandidateContent['status'][] = ['idea', 'candidate', 'approved', 'draft', 'review', 'published', 'refresh', 'archived'];

export const nextCandidateStatuses: Record<CandidateContent['status'], CandidateContent['status'][]> = {
  idea: ['candidate', 'archived'],
  candidate: ['approved', 'archived'],
  approved: ['draft', 'archived'],
  draft: ['review', 'archived'],
  review: ['draft', 'published', 'archived'],
  published: ['refresh', 'archived'],
  refresh: ['draft', 'archived'],
  archived: []
};

const text = (value: unknown, field: string, max: number) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required.`);
  return value.trim().slice(0, max);
};

const score = (value: unknown, field: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) throw new Error(`${field} must be between 0 and 100.`);
  return Math.round(parsed);
};

export function normalizeCandidateUpdate(input: unknown, currentStatus: CandidateContent['status']) {
  if (!input || typeof input !== 'object') throw new Error('A JSON object is required.');
  const raw = input as Record<string, any>;
  const status = candidateStatuses.includes(raw.status) ? raw.status as CandidateContent['status'] : currentStatus;
  if (status !== currentStatus && !nextCandidateStatuses[currentStatus].includes(status)) {
    throw new Error(`Status cannot move from ${currentStatus} to ${status}.`);
  }

  const pageType = pageTypes.includes(raw.pageType) ? raw.pageType as PageType : null;
  if (!pageType) throw new Error('A supported page type is required.');
  const slug = text(raw.slug, 'Slug', 120).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Slug must use lowercase letters, numbers and hyphens.');

  const gate: QualityGate = {
    intentDifference: score(raw.qualityGate?.intentDifference, 'Intent difference'),
    uniqueness: score(raw.qualityGate?.uniqueness, 'Uniqueness'),
    assetReadiness: score(raw.qualityGate?.assetReadiness, 'Asset readiness'),
    cannibalizationRisk: score(raw.qualityGate?.cannibalizationRisk, 'Cannibalization risk'),
    buyerValue: score(raw.qualityGate?.buyerValue, 'Buyer value'),
    passed: false,
    notes: Array.isArray(raw.qualityGate?.notes)
      ? raw.qualityGate.notes.filter((item: unknown): item is string => typeof item === 'string' && Boolean(item.trim())).map((item: string) => item.trim().slice(0, 240)).slice(0, 8)
      : []
  };
  gate.passed = gate.intentDifference >= 65 && gate.uniqueness >= 70 && gate.assetReadiness >= 50 && gate.cannibalizationRisk <= 55 && gate.buyerValue >= 65;
  if (['approved', 'draft', 'review', 'published'].includes(status) && !gate.passed) {
    throw new Error('The quality gate must pass before this status can be used.');
  }
  const qualityScore = Math.round((gate.intentDifference + gate.uniqueness + gate.assetReadiness + gate.buyerValue + (100 - gate.cannibalizationRisk)) / 5);
  const reason = typeof raw.reason === 'string' ? raw.reason.trim().slice(0, 500) : '';
  if (status !== currentStatus && !reason) throw new Error('A transition reason is required when status changes.');

  return {
    status,
    row: {
      slug,
      title: text(raw.title, 'Title', 160),
      meta_description: text(raw.metaDescription, 'Meta description', 320),
      intent_summary: text(raw.intentSummary, 'Intent summary', 500),
      primary_query: text(raw.primaryKeyword, 'Primary keyword', 160),
      recommended_page_type: pageType,
      outline: Array.isArray(raw.outline) ? raw.outline.filter((item: unknown): item is string => typeof item === 'string' && Boolean(item.trim())).map((item: string) => item.trim().slice(0, 180)).slice(0, 16) : [],
      opportunity_score: score(raw.opportunityScore, 'Opportunity score'),
      quality_score: qualityScore,
      quality_gate: gate,
      ...(status !== currentStatus ? { status, reason } : {})
    }
  };
}
