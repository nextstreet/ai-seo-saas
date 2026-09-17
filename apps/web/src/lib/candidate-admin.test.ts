import { describe, expect, it } from 'vitest';
import { normalizeCandidateUpdate } from './candidate-admin';

const input = {
  slug: 'heart-window-guide', title: 'Heart Window Guide', metaDescription: 'A useful meta description.',
  intentSummary: 'A distinct buyer intent.', primaryKeyword: 'heart window ita bag', pageType: 'intent_guide',
  outline: ['Intent', 'Materials'], opportunityScore: 78, status: 'approved', reason: 'Original assets are ready.',
  qualityGate: { intentDifference: 75, uniqueness: 80, assetReadiness: 70, cannibalizationRisk: 20, buyerValue: 82, notes: ['Ready'] }
};

describe('normalizeCandidateUpdate', () => {
  it('recalculates the quality gate and permits a valid transition', () => {
    const result = normalizeCandidateUpdate(input, 'candidate');
    expect(result.row.quality_gate.passed).toBe(true);
    expect(result.row.quality_score).toBe(77);
    expect(result.status).toBe('approved');
  });

  it('rejects skipped lifecycle states', () => {
    expect(() => normalizeCandidateUpdate({ ...input, status: 'published' }, 'candidate')).toThrow('Status cannot move');
  });

  it('rejects approval when the gate does not pass', () => {
    expect(() => normalizeCandidateUpdate({ ...input, qualityGate: { ...input.qualityGate, uniqueness: 20 } }, 'candidate')).toThrow('quality gate');
  });
});
