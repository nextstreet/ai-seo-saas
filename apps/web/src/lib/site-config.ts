import { supabase } from './supabase';
import { collection as defaultCollection, type CollectionItem } from './collection';
import { readLocalSiteConfig } from './site-config-local';

export const homeSectionKeys = ['browse', 'collection', 'process', 'decision', 'community', 'guides'] as const;
export type HomeSectionKey = (typeof homeSectionKeys)[number];
export const routeKeys = ['collection', 'gallery', 'customize', 'guides'] as const;
export type RouteKey = (typeof routeKeys)[number];

type PageIntro = { eyebrow: string; title: string; description: string };
type SectionCopy = PageIntro & { ctaLabel: string };

export interface SiteConfig {
  brand: { name: string; suffix: string; tagline: string };
  navigation: { bags: string; create: string; studio: string; guides: string; cta: string };
  hero: {
    eyebrow: string; title: string; description: string; image: string;
    primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string;
  };
  benefits: string[];
  announcement: { primary: string; secondary: string; linkLabel: string };
  seo: { indexable: boolean; ogImage: string };
  theme: { primary: string; primaryHover: string; accent: string; surface: string; alternate: string; page: string; text: string; muted: string; line: string };
  layout: { contentMax: number; sectionSpacing: number; cardColumns: 2 | 3 | 4 };
  home: { sectionOrder: HomeSectionKey[]; visible: Record<HomeSectionKey, boolean>; sections: Record<HomeSectionKey, SectionCopy> };
  pages: Record<RouteKey, PageIntro>;
  routes: Record<RouteKey, string>;
  catalog: CollectionItem[];
  footer: { eyebrow: string; title: string };
}

export const defaultSiteConfig: SiteConfig = {
  brand: { name: 'ITA', suffix: 'ATELIER', tagline: 'Custom ita bag concepts shaped around the things people collect.' },
  navigation: { bags: 'The bags', create: 'Create', studio: 'Design studio', guides: 'Field notes', cta: 'Create your bag' },
  announcement: { primary: 'Original concept collection', secondary: 'Plan around pins, photocards and daily use', linkLabel: 'Vote in the studio' },
  hero: {
    eyebrow: 'The collection starts with you', title: 'Carry the things\nthat light you up.',
    description: 'Original ita bag concepts for favorite pins, treasured cards and the collections that deserve their own view.',
    image: '/images/campaign.webp', primaryLabel: 'Explore the bags', primaryHref: '/collection',
    secondaryLabel: 'Build a design brief', secondaryHref: '/customize'
  },
  benefits: ['Browse by collection', 'Compare design directions', 'Save and vote on concepts', 'Build a maker-ready brief'],
  seo: { indexable: false, ogImage: '/images/campaign.webp' },
  theme: { primary: '#153f34', primaryHover: '#0c3028', accent: '#d93652', surface: '#e8f0eb', alternate: '#dfeef5', page: '#fbfbf8', text: '#171c1a', muted: '#5e6864', line: '#d7ddd9' },
  layout: { contentMax: 1280, sectionSpacing: 88, cardColumns: 3 },
  home: {
    sectionOrder: [...homeSectionKeys],
    visible: Object.fromEntries(homeSectionKeys.map((key) => [key, true])) as Record<HomeSectionKey, boolean>,
    sections: {
      browse: { eyebrow: 'Start with what you collect', title: 'Find a direction that fits.', description: 'Browse by display object and occasion, then refine the bag shape around how the collection will be carried.', ctaLabel: '' },
      collection: { eyebrow: 'Concept collection / 01', title: 'Three ways to make it yours.', description: '', ctaLabel: 'View all concepts' },
      process: { eyebrow: 'From idea to clear direction', title: 'A simpler custom journey.', description: 'Each step turns taste into useful design information, without asking you to understand production terminology first.', ctaLabel: '' },
      decision: { eyebrow: 'Collection-first design', title: 'See the effect. Understand the choices.', description: 'A visual concept creates the desire. Clear planning notes explain how display size, protection and daily use affect the final bag.', ctaLabel: 'Match a bag to your collection' },
      community: { eyebrow: 'Designed in the open', title: 'Your vote shapes what comes next.', description: '', ctaLabel: 'Enter the design studio' },
      guides: { eyebrow: 'Field notes', title: 'Make the design work in real life.', description: '', ctaLabel: 'Browse all guides' }
    }
  },
  pages: {
    collection: { eyebrow: 'The concept collection', title: 'Find your kind of carry.', description: 'Start with the things you collect, the way you plan to carry them or simply a color direction you love.' },
    gallery: { eyebrow: 'Community design studio', title: 'Which idea should move forward?', description: 'Save the directions that fit you and vote for the concepts you want to see developed further.' },
    customize: { eyebrow: 'Custom planning studio', title: 'Turn a favorite collection into a clear brief.', description: 'Choose what you carry and how you use it. The preview translates those choices into practical points to discuss with a maker.' },
    guides: { eyebrow: 'Field notes', title: 'Ideas are better with useful details.', description: 'Explore bag types, display arrangements and practical questions before turning a visual direction into a brief.' }
  },
  routes: { collection: '/collection', gallery: '/gallery', customize: '/customize', guides: '/guides' },
  catalog: defaultCollection,
  footer: { eyebrow: 'A collection can begin with one idea', title: 'Bring yours into focus.' }
};

const textValue = (value: unknown, fallback: string, max = 180) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
const colorValue = (value: unknown, fallback: string) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
const numberValue = (value: unknown, fallback: number, min: number, max: number) => Math.min(max, Math.max(min, Number(value) || fallback));
const enumValue = <T extends string>(value: unknown, fallback: T, allowed: readonly T[]) => allowed.includes(value as T) ? value as T : fallback;

export function routeValue(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const path = value.trim().replace(/\/$/, '') || '/';
  if (!/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(path)) return fallback;
  if (/^\/(admin|api|content|designs)(\/|$)/.test(path)) return fallback;
  return path;
}

export function normalizeSiteConfig(input: unknown): SiteConfig {
  const raw = input && typeof input === 'object' ? input as Record<string, any> : {};
  const order = Array.isArray(raw.home?.sectionOrder) ? raw.home.sectionOrder.filter((key: unknown): key is HomeSectionKey => homeSectionKeys.includes(key as HomeSectionKey)) : [];
  const sectionOrder = [...new Set([...order, ...homeSectionKeys])];
  const routes = Object.fromEntries(routeKeys.map((key) => [key, routeValue(raw.routes?.[key], defaultSiteConfig.routes[key])])) as Record<RouteKey, string>;
  const seenRoutes = new Set<string>();
  for (const key of routeKeys) {
    if (seenRoutes.has(routes[key])) routes[key] = defaultSiteConfig.routes[key];
    seenRoutes.add(routes[key]);
  }
  const rawCatalog = Array.isArray(raw.catalog) ? raw.catalog : [];
  const catalog = defaultCollection.map((fallback, index) => {
    const item = rawCatalog[index] && typeof rawCatalog[index] === 'object' ? rawCatalog[index] : {};
    return {
      ...fallback,
      slug: routeValue(`/${item.slug || fallback.slug}`, `/${fallback.slug}`).slice(1),
      name: textValue(item.name, fallback.name, 80),
      type: enumValue(item.type, fallback.type, ['Backpack', 'Crossbody', 'Tote']),
      color: textValue(item.color, fallback.color, 60),
      swatch: colorValue(item.swatch, fallback.swatch),
      image: textValue(item.image, fallback.image, 300),
      display: enumValue(item.display, fallback.display, ['Pins', 'Photocards']),
      mood: enumValue(item.mood, fallback.mood, ['Playful', 'Soft', 'Minimal']),
      occasion: enumValue(item.occasion, fallback.occasion, ['Conventions', 'Everyday']),
      window: enumValue(item.window, fallback.window, ['Heart', 'Rectangle']),
      collectionSize: enumValue(item.collectionSize, fallback.collectionSize, ['Small', 'Medium', 'Large']),
      description: textValue(item.description, fallback.description, 320),
      note: textValue(item.note, fallback.note, 320)
    };
  });
  return {
    brand: {
      name: textValue(raw.brand?.name, defaultSiteConfig.brand.name, 30),
      suffix: textValue(raw.brand?.suffix, defaultSiteConfig.brand.suffix, 30),
      tagline: textValue(raw.brand?.tagline, defaultSiteConfig.brand.tagline, 220)
    },
    navigation: Object.fromEntries(Object.entries(defaultSiteConfig.navigation).map(([key, fallback]) => [key, textValue(raw.navigation?.[key], fallback, 40)])) as SiteConfig['navigation'],
    announcement: Object.fromEntries(Object.entries(defaultSiteConfig.announcement).map(([key, fallback]) => [key, textValue(raw.announcement?.[key], fallback, 100)])) as SiteConfig['announcement'],
    hero: {
      eyebrow: textValue(raw.hero?.eyebrow, defaultSiteConfig.hero.eyebrow, 80), title: textValue(raw.hero?.title, defaultSiteConfig.hero.title, 100),
      description: textValue(raw.hero?.description, defaultSiteConfig.hero.description, 260), image: textValue(raw.hero?.image, defaultSiteConfig.hero.image, 300),
      primaryLabel: textValue(raw.hero?.primaryLabel, defaultSiteConfig.hero.primaryLabel, 50), primaryHref: raw.hero?.primaryHref === defaultSiteConfig.hero.primaryHref ? routes.collection : textValue(raw.hero?.primaryHref, routes.collection, 200),
      secondaryLabel: textValue(raw.hero?.secondaryLabel, defaultSiteConfig.hero.secondaryLabel, 50), secondaryHref: raw.hero?.secondaryHref === defaultSiteConfig.hero.secondaryHref ? routes.customize : textValue(raw.hero?.secondaryHref, routes.customize, 200)
    },
    benefits: Array.isArray(raw.benefits) ? raw.benefits.map((item: unknown) => textValue(item, '', 80)).filter(Boolean).slice(0, 6) : defaultSiteConfig.benefits,
    seo: { indexable: raw.seo?.indexable === true, ogImage: textValue(raw.seo?.ogImage, defaultSiteConfig.seo.ogImage, 300) },
    theme: Object.fromEntries(Object.entries(defaultSiteConfig.theme).map(([key, fallback]) => [key, colorValue(raw.theme?.[key], fallback)])) as SiteConfig['theme'],
    layout: {
      contentMax: numberValue(raw.layout?.contentMax, defaultSiteConfig.layout.contentMax, 960, 1600),
      sectionSpacing: numberValue(raw.layout?.sectionSpacing, defaultSiteConfig.layout.sectionSpacing, 48, 120),
      cardColumns: numberValue(raw.layout?.cardColumns, defaultSiteConfig.layout.cardColumns, 2, 4) as 2 | 3 | 4
    },
    home: {
      sectionOrder,
      visible: Object.fromEntries(homeSectionKeys.map((key) => [key, raw.home?.visible?.[key] !== false])) as Record<HomeSectionKey, boolean>,
      sections: Object.fromEntries(homeSectionKeys.map((key) => [key, Object.fromEntries(Object.entries(defaultSiteConfig.home.sections[key]).map(([field, fallback]) => [field, textValue(raw.home?.sections?.[key]?.[field], fallback, field === 'description' ? 320 : 100)]))])) as Record<HomeSectionKey, SectionCopy>
    },
    pages: Object.fromEntries(routeKeys.map((key) => [key, Object.fromEntries(Object.entries(defaultSiteConfig.pages[key]).map(([field, fallback]) => [field, textValue(raw.pages?.[key]?.[field], fallback, field === 'description' ? 320 : 120)]))])) as Record<RouteKey, PageIntro>,
    routes,
    catalog,
    footer: { eyebrow: textValue(raw.footer?.eyebrow, defaultSiteConfig.footer.eyebrow, 90), title: textValue(raw.footer?.title, defaultSiteConfig.footer.title, 100) }
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!supabase) {
    const local = await readLocalSiteConfig();
    return local ? normalizeSiteConfig(local) : defaultSiteConfig;
  }
  const slug = import.meta.env.PUBLIC_TENANT_SLUG || 'ita-bag-lab';
  const { data } = await supabase.from('site_settings').select('config').eq('tenant_slug', slug).eq('is_active', true).maybeSingle();
  return data?.config ? normalizeSiteConfig(data.config) : defaultSiteConfig;
}
