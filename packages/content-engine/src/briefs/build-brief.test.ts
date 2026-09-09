import { describe, expect, it } from 'vitest';
import { buildBrief } from './build-brief.js';

describe('buildBrief', () => {
  it('uses page-type-specific guide sections', () => {
    const brief = buildBrief({
      tenantId: 'tenant-1',
      primaryTopic: 'Ita Bag Inserts',
      primaryIntent: 'learn',
      pageType: 'guide',
      facts: ['Inserts can be detachable.'],
      relatedTopics: ['PVC windows'],
    });

    expect(brief.reviewRequired).toBe(true);
    expect(brief.requiredSections).toContain('Step-by-step guidance');
  });
});
