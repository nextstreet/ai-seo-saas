import { describe, expect, it } from 'vitest';
import { defaultSiteConfig, normalizeSiteConfig, routeValue } from './site-config';

describe('site configuration', () => {
  it('accepts clean public aliases and rejects reserved paths', () => {
    expect(routeValue('/design-studio', '/gallery')).toBe('/design-studio');
    expect(routeValue('/admin/settings', '/gallery')).toBe('/gallery');
    expect(routeValue('/Upper Case', '/guides')).toBe('/guides');
  });

  it('normalizes page content, module copy and catalog fields', () => {
    const config = normalizeSiteConfig({
      routes: { collection: '/bags' },
      pages: { collection: { title: 'Edited collection title' } },
      home: { sections: { browse: { title: 'Edited module title' } } },
      catalog: [{ name: 'Edited Sweetheart', slug: 'edited-sweetheart', swatch: '#123456' }]
    });

    expect(config.routes.collection).toBe('/bags');
    expect(config.pages.collection.title).toBe('Edited collection title');
    expect(config.home.sections.browse.title).toBe('Edited module title');
    expect(config.catalog[0]?.name).toBe('Edited Sweetheart');
    expect(config.catalog[0]?.type).toBe(defaultSiteConfig.catalog[0]?.type);
  });
});
