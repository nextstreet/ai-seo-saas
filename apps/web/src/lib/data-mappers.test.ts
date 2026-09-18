import { describe, expect, it } from 'vitest';
import { mapCandidate, mapGalleryItem, mapPublishedContent } from './data-mappers';

describe('Supabase storefront mappers', () => {
  it('maps a published content row', () => {
    const page = mapPublishedContent({
      id: 'page-1', tenant_id: 'tenant-1', source_candidate_id: 'candidate-1', slug: 'custom-ita-bag',
      page_type: 'product', primary_keyword: 'custom ita bag', title: 'Custom Ita Bag',
      meta_description: 'A buyer-focused description.', hero_summary: 'A useful summary.',
      body: [{ heading: 'Decisions', paragraphs: ['Choose the display first.'] }],
      internal_links: [{ label: 'Materials', slug: 'ita-bag-materials' }], published_at: '2026-09-15'
    });

    expect(page.slug).toBe('custom-ita-bag');
    expect(page.body).toHaveLength(1);
    expect(page.internalLinks[0]?.slug).toBe('ita-bag-materials');
  });

  it('derives a usable candidate gate from normalized columns', () => {
    const candidate = mapCandidate({
      id: 'candidate-1', tenant_id: 'tenant-1', topic_id: 'topic-1', slug: 'heart-window-ita-bag',
      recommended_page_type: 'design_inspiration', primary_query: 'heart window ita bag',
      title: 'Heart Window Ita Bag Ideas', meta_description: 'Intent-specific design guidance.',
      intent_summary: 'Design intent', outline: ['Window', 'Insert'], opportunity_score: 82,
      uniqueness_score: 76, information_gain_score: 74, commercial_score: 68,
      cannibalization_score: 22, status: 'approved', reason: 'Distinct visual intent.'
    });

    expect(candidate.qualityGate.passed).toBe(true);
    expect(candidate.qualityScore).toBeGreaterThan(0);
    expect(candidate.status).toBe('approved');
  });

  it('reads gallery presentation data from concept attributes', () => {
    const item = mapGalleryItem({
      id: 'design-1', tenant_id: 'tenant-1', name: 'Sweetheart', description: 'Pink heart-window concept.',
      attributes: { imageUrl: '/images/heart.webp', tags: ['pink', 'pins'] }
    }, 42);

    expect(item.imageUrl).toBe('/images/heart.webp');
    expect(item.tags).toEqual(['pink', 'pins']);
    expect(item.votesCount).toBe(42);
  });
});
