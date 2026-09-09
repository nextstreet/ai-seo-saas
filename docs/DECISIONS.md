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
