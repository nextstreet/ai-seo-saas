import type { PublishedContent } from './types';
import type { SiteConfig } from './site-config';

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] || character);

export function buildSitemap(siteUrl: string, config: SiteConfig, pages: PublishedContent[]) {
  const origin = new URL(siteUrl);
  const paths = new Map<string, string | undefined>();
  ['/', ...Object.values(config.routes)].forEach((path) => paths.set(path, undefined));
  config.catalog.forEach((item) => paths.set(`/designs/${item.slug}`, undefined));
  pages.forEach((page) => paths.set(`/content/${page.slug}`, page.publishedAt));
  const urls = [...paths.entries()].map(([path, lastModified]) => {
    const lastmod = lastModified ? `<lastmod>${escapeXml(new Date(lastModified).toISOString())}</lastmod>` : '';
    return `<url><loc>${escapeXml(new URL(path, origin).toString())}</loc>${lastmod}</url>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
