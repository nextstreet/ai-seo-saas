# Web

Static-first Astro delivery layer for crawlable pages, metadata, Schema,
internal links, and later lightweight interactive Islands. Keep SEO scoring and
secret-bearing database operations outside this package.

The site loads tenant-scoped, published pages and site chrome from Directus at
build time. Without Directus configuration it falls back to reviewed Markdown
through a typed Content Collection. Both paths render canonical URLs, JSON-LD,
breadcrumbs, and related links. `/studio/` is a deterministic build-time
developer view; it is not an administrative publishing endpoint.

See `../../docs/DIRECTUS.md` for the collection contract, permissions, environment,
and publish-to-deploy workflow.
