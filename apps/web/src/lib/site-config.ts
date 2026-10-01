import { supabase } from './supabase';
import { collection as defaultCollection, type CollectionItem } from './collection';
import { readLocalSiteConfig } from './site-config-local';
import { getDirectusSitePayload } from './directus-cms';

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
    customize: { eyebrow: 'Custom planning studio', title: 'Turn a favorite collection into a clear …8437 tokens truncated…definitionField.field)) {
      await request(`/fields/${definition.name}`, { method: 'POST', body: JSON.stringify(definitionField) });
    }
  }
}

const relations = [
  ['cms_categories', 'tenant_id', 'cms_tenants'], ['cms_materials', 'tenant_id', 'cms_tenants'],
  ['cms_products', 'tenant_id', 'cms_tenants'], ['cms_products', 'category_id', 'cms_categories'], ['cms_pages', 'tenant_id', 'cms_tenants'],
  ['cms_site_settings', 'tenant_id', 'cms_tenants'], ['cms_keyword_targets', 'tenant_id', 'cms_tenants'],
  ['cms_menus', 'tenant_id', 'cms_tenants'], ['cms_social_campaigns', 'tenant_id', 'cms_tenants'], ['cms_social_posts', 'tenant_id', 'cms_tenants'], ['cms_inquiries', 'tenant_id', 'cms_tenants'],
  ['cms_categories', 'parent_id', 'cms_categories'], ['cms_category_translations', 'category_id', 'cms_categories'], ['cms_material_translations', 'material_id', 'cms_materials'],
  ['cms_product_translations', 'product_id', 'cms_products'], ['cms_page_translations', 'page_id', 'cms_pages'],
  ['cms_product_materials', 'product_id', 'cms_products'], ['cms_product_materials', 'material_id', 'cms_materials'],
  ['cms_content_blocks', 'page_id', 'cms_pages'], ['cms_content_block_translations', 'content_block_id', 'cms_content_blocks'],
  ['cms_site_settings_translations', 'site_settings_id', 'cms_site_settings'],
  ['cms_menu_items', 'menu_id', 'cms_menus'], ['cms_menu_items', 'parent_id', 'cms_menu_items'], ['cms_menu_item_translations', 'menu_item_id', 'cms_menu_items'],
  ['cms_social_posts', 'campaign_id', 'cms_social_campaigns'], ['cms_inquiries', 'product_id', 'cms_products'],
];
const existingRelations = new Set((await request('/relations')).data.map((item) => `${item.collection}.${item.field}`));
for (const [collection, relationField, relatedCollection] of relations) {
  if (!existingRelations.has(`${collection}.${relationField}`)) {
    await request('/relations', { method: 'POST', body: JSON.stringify({ collection, field: relationField, related_collection: relatedCollection, schema: { on_delete: 'CASCADE' } }) });
  }
}

async function findOne(collection, filter) {
  const result = await request(`/items/${collection}?filter=${encodeURIComponent(JSON.stringify(filter))}&limit=1`);
  return result.data[0];
}
async function create(collection, data) {
  return (await request(`/items/${collection}`, { method: 'POST', body: JSON.stringify(data) })).data;
}

let tenant = await findOne('cms_tenants', { slug: { _eq: 'ita-bag-lab' } });
if (!tenant) tenant = await create('cms_tenants', { slug: 'ita-bag-lab', name: 'Ita Bag Design Lab', primary_locale: 'en-US', available_locales: ['en-US', 'zh-CN'], status: 'active' });

let settings = await findOne('cms_site_settings', { tenant_id: { _eq: tenant.id } });
if (!settings) settings = await create('cms_site_settings', { tenant_id: tenant.id, status: 'published', base_config: { seo: { indexable: false }, brand: { name: 'ITA', suffix: 'ATELIER' } } });
for (const translation of [
  { languages_code: 'en-US', config: { brand: { name: 'ITA', suffix: 'ATELIER', tagline: 'Custom ita bag concepts shaped around the things people collect.' } } },
  { languages_code: 'zh-CN', config: { brand: { name: 'ITA', suffix: 'ATELIER', tagline: '围绕你的收藏，设计专属痛包。' }, navigation: { bags: '痛包系列', create: '开始设计', studio: '设计工坊', guides: '选购指南', cta: '定制痛包' } } },
]) {
  const found = await findOne('cms_site_settings_translations', { site_settings_id: { _eq: settings.id }, languages_code: { _eq: translation.languages_code } });
  if (!found) await create('cms_site_settings_translations', { site_settings_id: settings.id, ...translation });
}

const seedProducts = [
  { key: 'sweetheart', sort: 10, facts: { product_type: 'Backpack', color: 'Blush pink', swatch: '#eaa8bc', image_url: '/images/heart.webp', display_type: 'Pins', mood: 'Playful', occasion: 'Conventions', window_shape: 'Heart', collection_size: 'Large' }, en: { name: 'The Sweetheart', description: 'A heart-shaped frame for the little things you love.', note: 'Start with one focal pin and leave breathing room around the edge.', primary_keyword: 'heart ita backpack' }, zh: { name: '甜心痛包', description: '心形展示窗，为喜爱的徽章与纪念物留出主角位置。', note: '先确定一枚主徽章，再围绕它安排较小配件。', primary_keyword: '心形痛包' } },
  { key: 'mint-story', sort: 20, facts: { product_type: 'Crossbody', color: 'Mint green', swatch: '#abcbbd', image_url: '/images/mint.webp', display_type: 'Photocards', mood: 'Soft', occasion: 'Everyday', window_shape: 'Rectangle', collection_size: 'Small' }, en: { name: 'Mint Story', description: 'A fresh mint palette and a clean window for favorite photocards.', note: 'Use protective sleeves and confirm usable window dimensions.', primary_keyword: 'photocard ita crossbody bag' }, zh: { name: '薄荷故事', description: '清新的薄荷色与简洁展示窗，适合随身携带喜爱的拍立得卡。', note: '使用保护套，并提前确认展示窗的可用尺寸。', primary_keyword: '拍立得卡痛包' } },
  { key: 'after-hours', sort: 30, facts: { product_type: 'Tote', color: 'Black', swatch: '#25282b', image_url: '/images/noir.webp', display_type: 'Pins', mood: 'Minimal', occasion: 'Everyday', window_shape: 'Rectangle', collection_size: 'Medium' }, en: { name: 'After Hours', description: 'A quieter black canvas for a collection with personality.', note: 'Repeat one metal finish and use a dark insert for contrast.', primary_keyword: 'black ita tote bag' }, zh: { name: '午夜之后', description: '低调的黑色画布，让收藏细节成为视觉焦点。', note: '统一五金颜色，并用深色内衬衬托金属细节。', primary_keyword: '黑色痛包托特包' } },
];
for (const seed of seedProducts) {
  let product = await findOne('cms_product_translations', { slug: { _eq: seed.key }, languages_code: { _eq: 'en-US' } });
  let productId = product?.product_id;
  if (!productId) productId = (await create('cms_products', { tenant_id: tenant.id, status: 'published', sort: seed.sort, ...seed.facts })).id;
  for (const [languages_code, copy] of [['en-US', seed.en], ['zh-CN', seed.zh]]) {
    const found = await findOne('cms_product_translations', { product_id: { _eq: productId }, languages_code: { _eq: languages_code } });
    if (!found) await create('cms_product_translations', { product_id: productId, languages_code, slug: seed.key, search_intent: 'commercial_inspiration', highlights: [], planning_points: [], ...copy });
  }
}

console.log(`Directus V1 schema and starter content are ready at ${baseUrl}`);
