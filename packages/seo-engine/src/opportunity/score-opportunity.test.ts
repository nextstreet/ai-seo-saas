import { describe, expect, it } from 'vitest';
import { scoreOpportunity } from './score-opportunity.js';

describe('scoreOpportunity', () => {
  it('creates a strong opportunity when no matching page exists', () => {
    const result = scoreOpportunity({
      searchDemand: 70,
      commercialValue: 75,
      uniqueness: 80,
      informationGain: 85,
      cannibalizationRisk: 10,
      topicFit: 90,
      hasMatchingPage: false,
      recommendedPageType: 'customization',
    });
    expect(result.action).toBe('CREATE');
    expect(result.opportunityScore).toBeGreaterThan(70);
  });

  it('merges when cannibalization risk is high', () => {
    const result = scoreOpportunity({
      searchDemand: 80,
      commercialValue: 80,
      uniqueness: 50,
      informationGain: 50,
      cannibalizationRisk: 90,
      topicFit: 90,
      hasMatchingPage: true,
      recommendedPageType: 'guide',
    });
    expect(result.action).toBe('MERGE');
  });
});
