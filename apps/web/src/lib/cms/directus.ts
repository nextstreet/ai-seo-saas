import { normalizeCmsBlock, pageTypeSchema, type CmsBlock, type PageType } from '@ai-seo/shared';

export type CmsPage = {
  id: string;
  tenantId: string;
  path: string;
  pageType: PageType;
  title: string;
  seoTitle?: string;
  description: string;
  eyebrow?: string;
  lead?: string;
  bodyHtml: string;
  blocks: CmsBlock[];
  primaryTopic?: string;
  topicId?: string;
  relatedTopicIds: string[];
  publishedAt?: string;
  updatedAt?: string;
  noIndex: boolean;
};

export type CmsNavigationItem = {
  id: string;
  label: string;
  url: string;
  openInNewTab: boolean;
};

export type CmsSite = {
  siteName: string;
  footerText: string;
};

type DirectusListResponse = { data?: unknown };

const endpoint = import.meta.env.DIRECTUS_URL?.replace(/\/$/, '');
const token = import.meta.env.DIRECTUS_TOKEN;
const tenantId = import.meta.env.DIRECTUS_TENANT_ID;

const defaultNavigation: CmsNavigationItem[] = [
  { id: 'custom', label: 'Custom', url: '/custom/', openInNewTab: false },
  { id: 'guides', label: 'Guides', url: '/guides/', openInNewTab: false },
  { id: 'studio', label: 'V1 Studio', url: '/studio/', openInNewTab: false },
];

let pagePromise: Promise<CmsPage[]> | undefined;
let navigationPromise: Promise<CmsNavigationItem[]> | undefined;
let sitePromise: Promise<CmsSite | null> | undefined;

function configurationState(): 'disabled' | 'enabled' {
  if (!endpoint && !tenantId && !token) return 'disabled';
  if (!endpoint || !tenantId) {
    throw new Error(
      'Directus CMS configuration is incomplete. Set both DIRECTUS_URL and DIRECTUS_TENANT_ID, or remove all DIRECTUS_* values.',
    );
  }
  return 'enabled';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function requiredString(item: Record<string, unknown>, field: string, collection: string): string {
  const value = optionalString(item[field]);
  if (!value) throw new Error(`Directus ${collection} item is missing required field "${field}".`);
  return value;
}

function normalizePath(value: string): string {
  const path = value.trim();
  if (!path.startsWith('/') || path.includes('?') || path.includes('#')) {
    throw new Error(`Directus page path must be an absolute site path without query or hash: ${value}`);
  }
  return path === '/' ? path : `${path.replace(/\/+$/, '')}/`;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function navigationUrl(value: string): string {
  if (value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://') || value.startsWith('mailto:')) {
    return value;
  }
  throw new Error(`Directus navigation URL uses an unsupported scheme: ${value}`);
}

async function readCollection(collection: string, params: Record<string, string>): Promise<unknown[]> {
  if (configurationState() === 'disabled') return [];

  const url = new URL(`${endpoint!}/items/${collection}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set('filter[tenant_id][_eq]', tenantId!);

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Directus request for ${collection} failed with ${response.status} ${response.statusText}.`);
  }

  const payload = await response.json() as DirectusListResponse;
  if (!Array.isArray(payload.data)) throw new Error(`Directus ${collection} response did not contain a data array.`);
  return payload.data;
}

async function loadPages(): Promise<CmsPage[]> {
  const items = await readCollection('cms_pages', {
    fields: [
      'id', 'tenant_id', 'path', 'page_type', 'title', 'seo_title', 'description',
      'eyebrow', 'lead', 'body_html', 'primary_topic', 'topic_id', 'related_topic_ids',
      'published_at', 'date_updated', 'noindex',
      'blocks:id', 'blocks:tenant_id', 'blocks:block_type', 'blocks:heading', 'blocks:body', 'blocks:items',
      'blocks:cta_label', 'blocks:cta_url',
    ].join(','),
    'deep[blocks][_sort]': 'sort',
    'deep[blocks][_filter][tenant_id][_eq]': tenantId!,
    'filter[status][_eq]': 'published',
    sort: 'path',
    limit: '500',
  });

  const pages = items.map((value) => {
    const item = asRecord(value);
    if (!item) throw new Error('Directus cms_pages returned a non-object item.');
    const seoTitle = optionalString(item.seo_title);
    const eyebrow = optionalString(item.eyebrow);
    const lead = optionalString(item.lead);
    const primaryTopic = optionalString(item.primary_topic);
    const topicId = optionalString(item.topic_id);
    const publishedAt = optionalString(item.published_at);
    const updatedAt = optionalString(item.date_updated);
    const pageTenantId = requiredString(item, 'tenant_id', 'cms_pages');
    const rawBlocks = Array.isArray(item.blocks) ? item.blocks : [];
    const blocks = rawBlocks
      .filter((block) => asRecord(block) !== null)
      .map((block) => {
        const blockRecord = asRecord(block)!;
        const blockId = requiredString(blockRecord, 'id', 'cms_blocks');
        if (requiredString(blockRecord, 'tenant_id', 'cms_blocks') !== pageTenantId) {
          throw new Error(`Directus cms_blocks item ${blockId} does not match its page tenant.`);
        }
        return normalizeCmsBlock(blockRecord, blockId);
      });
    return {
      id: requiredString(item, 'id', 'cms_pages'),
      tenantId: pageTenantId,
      path: normalizePath(requiredString(item, 'path', 'cms_pages')),
      pageType: pageTypeSchema.parse(requiredString(item, 'page_type', 'cms_pages')),
      title: requiredString(item, 'title', 'cms_pages'),
      ...(seoTitle ? { seoTitle } : {}),
      description: requiredString(item, 'description', 'cms_pages'),
      ...(eyebrow ? { eyebrow } : {}),
      ...(lead ? { lead } : {}),
      bodyHtml: optionalString(item.body_html) ?? '',
      blocks,
      ...(primaryTopic ? { primaryTopic } : {}),
      ...(topicId ? { topicId } : {}),
      relatedTopicIds: stringArray(item.related_topic_ids),
      ...(publishedAt ? { publishedAt } : {}),
      ...(updatedAt ? { updatedAt } : {}),
      noIndex: item.noindex === true,
    };
  });
  const paths = new Set<string>();
  for (const page of pages) {
    if (paths.has(page.path)) throw new Error(`Directus cms_pages contains duplicate published path ${page.path}.`);
    paths.add(page.path);
  }
  return pages;
}

async function loadNavigation(): Promise<CmsNavigationItem[]> {
  const items = await readCollection('cms_navigation', {
    fields: 'id,label,url,open_in_new_tab,sort',
    'filter[status][_eq]': 'published',
    'filter[location][_eq]': 'header',
    sort: 'sort,label',
    limit: '100',
  });
  return items.map((value) => {
    const item = asRecord(value);
    if (!item) throw new Error('Directus cms_navigation returned a non-object item.');
    return {
      id: requiredString(item, 'id', 'cms_navigation'),
      label: requiredString(item, 'label', 'cms_navigation'),
      url: navigationUrl(requiredString(item, 'url', 'cms_navigation')),
      openInNewTab: item.open_in_new_tab === true,
    };
  });
}

async function loadSite(): Promise<CmsSite | null> {
  const items = await readCollection('cms_sites', {
    fields: 'id,site_name,footer_text',
    'filter[status][_eq]': 'published',
    limit: '2',
  });
  if (items.length > 1) throw new Error(`Directus cms_sites has multiple published rows for tenant ${tenantId}.`);
  const item = asRecord(items[0]);
  if (!item) return null;
  return {
    siteName: requiredString(item, 'site_name', 'cms_sites'),
    footerText: requiredString(item, 'footer_text', 'cms_sites'),
  };
}

export function isCmsEnabled(): boolean {
  return configurationState() === 'enabled';
}

export function getPublishedCmsPages(): Promise<CmsPage[]> {
  pagePromise ??= loadPages();
  return pagePromise;
}

export async function getPublishedCmsPage(path: string): Promise<CmsPage | undefined> {
  const normalizedPath = normalizePath(path);
  return (await getPublishedCmsPages()).find((page) => page.path === normalizedPath);
}

export async function getHeaderNavigation(): Promise<CmsNavigationItem[]> {
  navigationPromise ??= loadNavigation();
  const navigation = await navigationPromise;
  return isCmsEnabled() ? navigation : defaultNavigation;
}

export function getCmsSite(): Promise<CmsSite | null> {
  sitePromise ??= loadSite();
  return sitePromise;
}
