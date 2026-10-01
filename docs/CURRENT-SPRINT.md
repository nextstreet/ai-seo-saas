# Current Sprint — Foundation

## Goal

Turn the architecture into a reproducible local repository that Trae and Codex
CLI can understand without rereading the original conversation.

## Included in the skeleton

- [x] pnpm workspace and package boundaries.
- [x] minimal Astro static site.
- [x] shared strategy/content contracts.
- [x] deterministic opportunity scorer with tests.
- [x] page-type-aware content Brief builder with tests.
- [x] initial tenant-aware Supabase migration and RLS.
- [x] Ita Bag development seed data.
- [x] architecture and Codex workflow documentation.

## Completed in the first working V1

### 1. Topic Graph application service

- [x] Tenant-scoped repository contract and local in-memory implementation.
- [x] Create, link, list, and cycle-safe related-topic traversal.
- [x] Cross-tenant access coverage and an industry-neutral core package.
- [x] Build-time developer view at `/studio/`.

### 2. Candidate lifecycle

- [x] Deterministic, explainable opportunity decision.
- [x] Validated candidate transitions with required reasons.
- [x] Migration-backed status history with tenant RLS.
- [x] Review is mandatory before publication.

### 3. Reviewed Astro content pipeline

- [x] Discriminated schemas for customization and guide content.
- [x] One reviewed page of each type.
- [x] Canonical URL, metadata, JSON-LD, breadcrumbs, and related links.
- [x] Static sitemap output.

## Next implementation tasks

1. Deploy the included Directus stack and run the idempotent V1 bootstrap.
2. Finish locale-prefixed Astro routes and render Directus page blocks through a constrained component registry.
3. Migrate reviewed product/page copy from `site_settings.config.catalog` and `content_pages`, then remove the legacy editorial write UI.
4. Create the production Web Reader role and verify published-only access.
5. Research, review, and add the first coherent launch cluster; do not bulk-publish thin pages.

## Directus foundation completed

- [x] Separate local Directus/PostgreSQL service definition.
- [x] Idempotent multilingual V1 schema and starter-content bootstrap.
- [x] Server-only Astro reader with locale fallback and CMS outage fallback.
- [x] Flexible product count instead of the previous fixed three-item catalog.
- [x] Keyword-target and social-planning collections reserved for later flows.

## Explicitly deferred

GSC OAuth, production n8n flows, visual generation, social APIs, complete
forum, billing, and advanced AI orchestration.
