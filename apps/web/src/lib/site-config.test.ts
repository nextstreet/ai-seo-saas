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

  it('keeps default hero actions aligned with renamed public routes', () => {
    const config = normalizeSiteConfig({ routes: { collection: '/bags', customize: '/design-brief' } });
    expect(config.hero.primaryHref).toBe('/bags');
    expect(config.hero.secondaryHref).toBe('/design-brief');
  });

  it('accepts a variable-size CMS catalog and localized detail modules', () => {
    const catalog = [...defaultSiteConfig.catalog, {
      ...defaultSiteConfig.catalog[0],
      slug: 'fourth-concept',
      name: 'Fourth concept',
      highlights: [{ title: 'Localized highlight', text: 'Localized detail.' }],
      planningPoints: ['Localized planning point'],
    }];
    const config = normalizeSiteConfig({ catalog });

    expect(config.catalog).toHaveLength(4);
    expect(config.catalog[3]?.highlights[0]?.title).toBe('Localized highlight');
    expect(config.catalog[3]?.planningPoints).toEqual(['Localized planning point']);
  });
});
