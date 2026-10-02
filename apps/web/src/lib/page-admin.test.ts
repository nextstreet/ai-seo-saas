import { describe, expect, it } from 'vitest';
import { normalizePageTransition, normalizePageUpdate } from './page-admin';

describe('page admin validation', () => {
  it('normalizes editable page content', () => {
    expect(normalizePageUpdate({
      slug: 'Custom-Ita-Bag', title: 'Custom Ita Bag', primaryKeyword: 'custom ita bag',
      metaDescription: 'A useful description', heroSummary: 'A clear summary',
      body: [{ heading: 'Start here', paragraphs: ['A detailed paragraph for the buyer.'] }],
      internalLinks: [{ label: 'Materials', slug: 'ita-bag-materials' }]
    })).toMatchObject({ slug: 'custom-ita-bag', canonical_url: '/content/custom-ita-bag' });
  });

  it('rejects invalid transitions and missing reasons', () => {
    expect(() => normalizePageTransition({ status: 'published', reason: 'Ready' }, 'draft')).toThrow('cannot move');
    expect(() => normalizePageTransition({ status: 'review', reason: '' }, 'draft')).toThrow('required');
  });
});
