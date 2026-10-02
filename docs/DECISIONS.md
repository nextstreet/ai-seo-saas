# Architecture Decisions

This is a lightweight decision log. Change a decision only through a focused
commit that explains the new evidence.

## ADR-001 — Start with pnpm workspaces

**Status:** accepted

Use pnpm workspaces without Turborepo/Nx in V1. The current build graph is small,
and an additional orchestration layer has no demonstrated benefit yet.

## ADR-002 — Astro is the SEO delivery layer

**Status:** accepted

Use static-first Astro pages for crawlable content. Add dynamic Islands only for
vote, authentication, or other clearly interactive areas.

## ADR-003 — Supabase is not the CMS

**Status:** accepted

Supabase owns structured operational and SEO data. Reviewed long-form publishing
may begin in Astro Content Collections and later move to a headless CMS when
editorial collaboration requires it.

## ADR-004 — Candidate and page are different entities

**Status:** accepted

A candidate records a possible SEO action. A content page records a reviewed
site asset. Keeping them separate prevents automatic research output from
silently becoming published content.

## ADR-005 — Rules plus LLM before agents

**Status:** accepted

V1 uses deterministic scoring, structured LLM judgments, and explicit review.
No complex agent framework is added until real tasks demonstrate that simpler
workflows fail.

## ADR-006 — Multi-tenant from the schema, single validation tenant in practice

**Status:** accepted

Schema, RLS, and core contracts support multiple tenants. Product validation
focuses on one Ita Bag tenant until the SEO loop produces evidence.

## ADR-007 — Asset-centric social derivation

**Status:** accepted

SEO pages and social posts may derive from a shared content/design asset. Social
content is not modeled only as an article rewrite.

## ADR-008 — Product concepts begin as typed topic entities

**Status:** accepted

Product types, materials, features, components, and applications begin as topic
nodes. This avoids parallel taxonomies before subtype-specific fields exist.
Dedicated tables may be introduced later without changing their graph identity.

## ADR-009 — Directus owns editorial content

**Status:** accepted

Use Directus as the editorial source of truth for products, translations,
pages, reusable page blocks, media metadata, keyword placement, and social
content drafts. Keep Directus on a database separate from the existing
Supabase operational schema; the latter relies on tenant RLS, RPCs, and
composite constraints that should not be adopted as a Directus-managed schema.

Astro reads Directus on the server with a read-only token. AI and n8n may create
suggestions or drafts through dedicated service users, but they must not publish
without the existing review gate.

## ADR-010 — Localized fields use translation collections

**Status:** accepted

Keep language-neutral product facts on base records and localized slugs, copy,
SEO metadata, and component content in translation collections. The initial
locales are `en-US` and `zh-CN`; missing translations fall back to `en-US`.
Locale-specific keyword targets remain separate to prevent cross-language
cannibalization decisions.
