import { supabase } from './supabase';

export const homeSectionKeys = ['browse', 'collection', 'process', 'decision', 'community', 'guides'] as const;
export type HomeSectionKey = (typeof homeSectionKeys)[number];

export interface SiteConfig {
  brand: { name: string; suffix: string; tagline: string };
  navigation: { bags: string; create: string; studio: string; guides: string; cta: string };
  hero: {
    eyebrow: string; title: string; description: string; image: string;
    primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string;
  };
  benefits: string[];
  seo: { indexable: boolean; ogImage: string };
  theme: { primary: string; primaryHover: string; accent: string; surface: string; alternate: string; page: string; text: string; muted: string; line: string };
  layout: { contentMax: number; sectionSpacing: number; cardColumns: 2 | 3 | 4 };
  home: { sectionOrder: HomeSectionKey[]; visible: Record<HomeSectionKey, boolean> };
  footer: { eyebrow: string; title: string };
}

export const defaultSiteConfig: SiteConfig = {
  brand: { name: 'ITA', suffix: 'ATELIER', tagline: 'Custom ita bag concepts shaped around the things people collect.' },
  navigation: { bags: 'The bags', create: 'Create', studio: 'Design studio', guides: 'Field notes', cta: 'Create your bag' },
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
  home: { sectionOrder: [...homeSectionKeys], visible: Object.fromEntries(homeSectionKeys.map((key) => [key, true])) as Record<HomeSectionKey, boolean> },
  footer: { eyebrow: 'A collection can begin with one idea', title: 'Bring yours into focus.' }
};

const textValue = (value: unknown, fallback: string, max = 180) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
const colorValue = (value: unknown, fallback: string) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
const numberValue = (value: unknown, fallback: number, min: number, max: number) => Math.min(max, Math.max(min, Number(value) || fallback));

export function normalizeSiteConfig(input: unknown): SiteConfig {
  const raw = input && typeof input === 'object' ? input as Record<string, any> : {};
  const order = Array.isArray(raw.home?.sectionOrder) ? raw.home.sectionOrder.filter((key: unknown): key is HomeSectionKey => homeSectionKeys.includes(key as HomeSectionKey)) : [];
  const sectionOrder = [...new Set([...order, ...homeSectionKeys])];
  return {
    brand: {
      name: textValue(raw.brand?.name, defaultSiteConfig.brand.name, 30),
      suffix: textValue(raw.brand?.suffix, defaultSiteConfig.brand.suffix, 30),
      tagline: textValue(raw.brand?.tagline, defaultSiteConfig.brand.tagline, 220)
    },
    navigation: Object.fromEntries(Object.entries(defaultSiteConfig.navigation).map(([key, fallback]) => [key, textValue(raw.navigation?.[key], fallback, 40)])) as SiteConfig['navigation'],
    hero: {
      eyebrow: textValue(raw.hero?.eyebrow, defaultSiteConfig.hero.eyebrow, 80), title: textValue(raw.hero?.title, defaultSiteConfig.hero.title, 100),
      description: textValue(raw.hero?.description, defaultSiteConfig.hero.description, 260), image: textValue(raw.hero?.image, defaultSiteConfig.hero.image, 300),
      primaryLabel: textValue(raw.hero?.primaryLabel, defaultSiteConfig.hero.primaryLabel, 50), primaryHref: textValue(raw.hero?.primaryHref, defaultSiteConfig.hero.primaryHref, 200),
      secondaryLabel: textValue(raw.hero?.secondaryLabel, defaultSiteConfig.hero.secondaryLabel, 50), secondaryHref: textValue(raw.hero?.secondaryHref, defaultSiteConfig.hero.secondaryHref, 200)
    },
    benefits: Array.isArray(raw.benefits) ? raw.benefits.map((item: unknown) => textValue(item, '', 80)).filter(Boolean).slice(0, 6) : defaultSiteConfig.benefits,
    seo: { indexable: raw.seo?.indexable === true, ogImage: textValue(raw.seo?.ogImage, defaultSiteConfig.seo.ogImage, 300) },
    theme: Object.fromEntries(Object.entries(defaultSiteConfig.theme).map(([key, fallback]) => [key, colorValue(raw.theme?.[key], fallback)])) as SiteConfig['theme'],
    layout: {
      contentMax: numberValue(raw.layout?.contentMax, defaultSiteConfig.layout.contentMax, 960, 1600),
      sectionSpacing: numberValue(raw.layout?.sectionSpacing, defaultSiteConfig.layout.sectionSpacing, 48, 120),
      cardColumns: numberValue(raw.layout?.cardColumns, defaultSiteConfig.layout.cardColumns, 2, 4) as 2 | 3 | 4
    },
    home: { sectionOrder, visible: Object.fromEntries(homeSectionKeys.map((key) => [key, raw.home?.visible?.[key] !== false])) as Record<HomeSectionKey, boolean> },
    footer: { eyebrow: textValue(raw.footer?.eyebrow, defaultSiteConfig.footer.eyebrow, 90), title: textValue(raw.footer?.title, defaultSiteConfig.footer.title, 100) }
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!supabase) return defaultSiteConfig;
  const slug = import.meta.env.PUBLIC_TENANT_SLUG || 'ita-bag-lab';
  const { data } = await supabase.from('site_settings').select('config').eq('tenant_slug', slug).eq('is_active', true).maybeSingle();
  return data?.config ? normalizeSiteConfig(data.config) : defaultSiteConfig;
}
