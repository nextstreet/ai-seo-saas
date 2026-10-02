# Web

Static-first Astro delivery layer for crawlable pages, metadata, Schema,
internal links, and later lightweight interactive Islands. Keep SEO scoring and
secret-bearing database operations outside this package.

The V1 site loads reviewed Markdown through a typed Content Collection and
renders page-type-specific modules, canonical URLs, JSON-LD, breadcrumbs, and
related links. `/studio/` is a deterministic build-time developer view; it is
not an administrative publishing endpoint.

The storefront now also includes collection, design, gallery, voting, guide,
and design-brief routes. `/admin/site` controls tenant-specific brand, hero,
navigation, theme, density, homepage composition, social preview, and indexing
settings through a protected server endpoint. Apply the site-settings migration
and configure the server-only `SUPABASE_SECRET_KEY` and `ADMIN_API_TOKEN` before
publishing changes.
