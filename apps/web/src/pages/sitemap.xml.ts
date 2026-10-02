import type { APIRoute } from 'astro';
import { getPublishedContents } from '@/lib/data';
import { getSiteConfig } from '@/lib/site-config';
import { buildSitemap } from '@/lib/sitemap';

export const GET: APIRoute = async ({ site, url }) => {
  const [config, pages] = await Promise.all([getSiteConfig(), getPublishedContents()]);
  const xml = buildSitemap(import.meta.env.PUBLIC_SITE_URL || site?.toString() || url.origin, config, pages);
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
};
