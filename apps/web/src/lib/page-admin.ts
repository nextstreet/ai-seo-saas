import type { ContentPageStatus, PublishedContent } from './types';

export const nextPageStatuses: Record<ContentPageStatus, ContentPageStatus[]> = {
  draft: ['review', 'archived'],
  review: ['draft', 'published', 'archived'],
  published: ['refresh', 'archived'],
  refresh: ['draft', 'archived'],
  archived: []
};

const text = (value: unknown, field: string, max: number) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required.`);
  return value.trim().slice(0, max);
};

export function normalizePageUpdate(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('A JSON object is required.');
  const raw = input as Record<string, unknown>;
  const slug = text(raw.slug, 'Slug', 120).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Slug must use lowercase letters, numbers and hyphens.');

  const body = Array.isArray(raw.body) ? raw.body.slice(0, 24).map((value, index) => {
    const section = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    return {
      heading: text(section.heading, `Section ${index + 1} heading`, 180),
      paragraphs: Array.isArray(section.paragraphs)
        ? section.paragraphs.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim().slice(0, 4000)).slice(0, 12)
        : [],
      ...(Array.isArray(section.bullets) ? { bullets: section.bullets.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim().slice(0, 500)).slice(0, 20) } : {})
    };
  }) : [];

  const internalLinks = Array.isArray(raw.internalLinks) ? raw.internalLinks.slice(0, 24).map((value, index) => {
    const link = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    const linkSlug = text(link.slug, `Link ${index + 1} slug`, 120).toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(linkSlug)) throw new Error(`Link ${index + 1} slug is invalid.`);
    return { label: text(link.label, `Link ${index + 1} label`, 120), slug: linkSlug };
  }) : [];

  return {
    slug,
    title: text(raw.title, 'Title', 160),
    primary_keyword: text(raw.primaryKeyword, 'Primary keyword', 160),
    meta_description: text(raw.metaDescription, 'Meta description', 320),
    hero_summary: text(raw.heroSummary, 'Hero summary', 600),
    body: body as PublishedContent['body'],
    internal_links: internalLinks,
    canonical_url: `/content/${slug}`
  };
}

export function normalizePageTransition(input: unknown, currentStatus: ContentPageStatus) {
  if (!input || typeof input !== 'object') throw new Error('A JSON object is required.');
  const raw = input as Record<string, unknown>;
  const status = raw.status as ContentPageStatus;
  if (!nextPageStatuses[currentStatus].includes(status)) throw new Error(`Status cannot move from ${currentStatus} to ${String(status)}.`);
  return { status, reason: text(raw.reason, 'Transition reason', 500) };
}
