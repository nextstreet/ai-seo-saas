# Web

Static-first Astro delivery layer for crawlable pages, metadata, Schema,
internal links, and later lightweight interactive Islands. Keep SEO scoring and
secret-bearing database operations outside this package.

The V1 site loads reviewed Markdown through a typed Content Collection and
renders page-type-specific modules, canonical URLs, JSON-LD, breadcrumbs, and
related links. `/studio/` is a deterministic build-time developer view; it is
not an administrative publishing endpoint.
