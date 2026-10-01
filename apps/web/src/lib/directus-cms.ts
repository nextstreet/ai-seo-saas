import type { CollectionItem } from './collection';

type DirectusItem = Record<string, unknown>;

type CmsSitePayload = {
  config: Record<string, unknown>;
  catalog: CollectionItem[];
};

const apiUrl = () => (process.env.DIRECTUS_URL || import.meta.env.DIRECTUS_URL || '').replace(/\/$/, '');
const apiToken = () => process.env.DIRECTUS_TOKEN || import.meta.env.DIRECTUS_TOKEN || '';
const tenantSlug = () => import.meta.env.PUBLIC_TENANT_SLUG || 'ita-bag-lab';
const defaultLocale = () => import.meta.env.PUBLIC_DEFAULT_LOCALE || 'en-US';

function queryString(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

async function readItems(collection: string, params: Record<string, string>): Promise<DirectusItem[]> {
  const base = apiUrl();
  if (!base) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`${base}/items/${collection}?${queryString(params)}`, {
      headers: apiToken() ? { Authorization: `Bearer ${apiToken()}` } : {},
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const payload = await response.json() as { data?: DirectusItem[] };
    return Array.isArray(payload.data) ? payload.data : [];
  } finally {
    clearTimeout(timeout);
  }
}

const asText = (value: unknown, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;
const asArray = <T>(value: unknown, fallback: T[] = []) => Array.isArray(value) ? value as T[] : fallback;

export function mapDirectusProduct(product: DirectusItem, translation: DirectusItem): CollectionItem | null {
  const slug = asText(translation.slug);
  const name = asText(translation.name);
  if (!slug || !name) return null;

  return {
    slug,
    name,
    type: asText(product.product_type, 'Backpack') as CollectionItem['type'],
    color: asText(product.color, 'Custom'),
    swatch: asText(product.swatch, '#d7ddd9'),
    image: asText(product.image_url, '/images/campaign.webp'),
    display: asText(product.display_type, 'Pins') as CollectionItem['display'],
    mood: asText(product.mood, 'Playful') as CollectionItem['mood'],
    occasion: asText(product.occasion, 'Everyday') as CollectionItem['occasion'],
    window: asText(product.window_shape, 'Rectangle') as CollectionItem['window'],
    collectionSize: asText(product.collection_size, 'Medium') as CollectionItem['collectionSize'],
    description: asText(translation.description),
    note: asText(translation.note),
    highlights: asArray<{ title: string; text: string }>(translation.highlights),
    planningPoints: asArray<string>(translation.planning_points),
  };
}

async function translationsFor(collection: string, foreignKey: string, ids: string[], locale: string) {
  if (!ids.length) return [];
  const fields = `id,${foreignKey},languages_code,*`;
  const primary = await readItems(collection, {
    fields,
    filter: JSON.stringify({ [foreignKey]: { _in: ids }, languages_code: { _eq: locale } }),
    limit: '-1',
  });
  if (locale === defaultLocale()) return primary;
  const translatedIds = new Set(primary.map((item) => String(item[foreignKey])));
  const missing = ids.filter((id) => !translatedIds.has(id));
  if (!missing.length) return primary;
  const fallback = await readItems(collection, {
    fields,
    filter: JSON.stringify({ [foreignKey]: { _in: missing }, languages_code: { _eq: defaultLocale() } }),
    limit: '-1',
  });
  return [...primary, ...fallback];
}

export async function getDirectusSitePayload(locale = defaultLocale()): Promise<CmsSitePayload | null> {
  if (!apiUrl()) return null;
  try {
    const tenants = await readItems('cms_tenants', {
      fields: 'id,slug',
      filter: JSON.stringify({ slug: { _eq: tenantSlug() }, status: { _eq: 'active' } }),
      limit: '1',
    });
    const tenant = tenants[0];
    if (!tenant?.id) return null;
    const tenantId = String(tenant.id);

    const [products, settings] = await Promise.all([
      readItems('cms_products', {
        fields: '*',
        filter: JSON.stringify({ tenant_id: { _eq: tenantId }, status: { _eq: 'published' } }),
        sort: 'sort',
        limit: '-1',
      }),
      readItems('cms_site_settings', {
        fields: 'id,tenant_id,status,base_config',
        filter: JSON.stringify({ tenant_id: { _eq: tenantId }, status: { _eq: 'published' } }),
        limit: '1',
      }),
    ]);

    const productIds = products.map((item) => String(item.id));
    const productTranslations = await translationsFor('cms_product_translations', 'product_id', productIds, locale);
    const byProduct = new Map(productTranslations.map((item) => [String(item.product_id), item]));
    const catalog = products
      .map((product) => mapDirectusProduct(product, byProduct.get(String(product.id)) || {}))
      .filter((item): item is CollectionItem => Boolean(item));

    const setting = settings[0];
    let localizedConfig: Record<string, unknown> = {};
    if (setting?.id) {
      const translations = await translationsFor('cms_site_settings_translations', 'site_settings_id', [String(setting.id)], locale);
      localizedConfig = (translations[0]?.config && typeof translations[0].config === 'object')
        ? translations[0].config as Record<string, unknown>
        : {};
    }
    const baseConfig = setting?.base_config && typeof setting.base_config === 'object'
      ? setting.base_config as Record<string, unknown>
      : {};

    return { config: { ...baseConfig, ...localizedConfig }, catalog };
  } catch (error) {
    console.warn(`[directus] CMS read failed: ${(error as Error).message}`);
    return null;
  }
}

