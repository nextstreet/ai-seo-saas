# Directus CMS

Directus is the editorial source of truth for products, localized website copy,
page components, SEO fields, and social campaign drafts. Supabase remains the
operational store for topic graphs, candidates, votes, metrics, and AI jobs.

## Local start

1. Copy `directus/.env.example` to `directus/.env` and replace every password
   and secret.
2. Start the services from the repository root:

   ```bash
   pnpm cms:up
   ```

3. Wait for `http://localhost:8055/admin` to load, then export the same admin
   credentials and initialize the V1 model:

   ```bash
   DIRECTUS_URL=http://localhost:8055 \
   DIRECTUS_ADMIN_EMAIL=admin@example.com \
   DIRECTUS_ADMIN_PASSWORD=change-me-now \
   pnpm cms:bootstrap
   ```

The bootstrap is idempotent. It creates missing collections, fields, relations,
the Ita Bag tenant, English and Chinese site settings, and three starter
products. It does not overwrite existing editorial records.

## Web access

Set these server-side variables in the Astro runtime:

```dotenv
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=<static-token-for-a-read-only-web-role>
PUBLIC_DEFAULT_LOCALE=en-US
```

For local setup the admin token can prove the integration, but production must
use a dedicated static-token user with read-only access to published records in
the `cms_*` collections. Never expose `DIRECTUS_TOKEN` as a `PUBLIC_*` variable.

When Directus is unavailable, the storefront deliberately falls back to the
existing Supabase/local configuration. This keeps a CMS outage from replacing
published pages with an error response during migration.

## Editorial model

- `cms_products`: language-neutral product facts and publication state.
- `cms_product_translations`: localized slug, copy, SEO keywords, and intent.
- `cms_categories`, `cms_materials`, and their translations: reusable product taxonomy and facts.
- `cms_product_materials`: explicit product-to-material relationships.
- `cms_pages`: page identity, page type, state, and sort order.
- `cms_page_translations`: localized route and SEO metadata.
- `cms_content_blocks`: ordered component type and display settings.
- `cms_content_block_translations`: localized component payload.
- `cms_site_settings`: shared theme/configuration.
- `cms_site_settings_translations`: localized navigation and website copy.
- `cms_menus`, `cms_menu_items`, and translations: editable navigation trees.
- `cms_keyword_targets`: one locale-specific query cluster to one target.
- `cms_social_campaigns` and `cms_social_posts`: approval-ready social plans.
- `cms_inquiries`: private, structured custom-product requests.

Supported component types are deliberately constrained: `hero`,
`product_grid`, `image_text`, `benefits`, `specifications`,
`material_comparison`, `process_steps`, `gallery`, `faq`, `related_guides`,
`social_proof`, and `cta`. Adding a new type requires a Directus choice, an
Astro renderer, and a rendering test.

## Production checklist

- Use a separate managed PostgreSQL database for Directus.
- Configure object storage rather than the local uploads volume.
- Restrict the Web Reader role to published rows and required fields.
- Configure backups before editors begin entering production content.
- Put admin and automation tokens in the deployment secret store.
- Keep AI and n8n service users separate from human editor accounts.
