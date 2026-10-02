import { describe, expect, it } from 'vitest';
import { defaultSiteConfig } from './site-config';
import { buildSitemap } from './sitemap';

describe('buildSitemap', () => {
  it('includes configured routes, concepts and published pages without duplicates', () => {
    const config = { ...defaultSiteConfig, routes: { ...defaultSiteConfig.routes, collection: '/bags' } };
    const xml = buildSitemap('https://example.com', config, [{
      id: '1', tenantId: 'tenant', candidateId: 'candidate', slug: 'guide', pageType: 'intent_guide',
      primaryKeyword: 'guide', title: 'Guide', metaDescription: 'Guide', heroSummary: 'Guide', body: [], internalLinks: [], publishedAt: '2026-09-17'
    }]);
    expect(xml).toContain('https://example.com/bags');
    expect(xml).toContain('https://example.com/designs/sweetheart');
    expect(xml).toContain('https://example.com/content/guide');
    expect(xml).not.toContain('https://example.com/collection');
  });
});
