# Architecture

## System shape

```mermaid
flowchart TD
  Facts[Company and product facts] --> Graph[Topic and entity graph]
  Graph --> SEO[SEO opportunity engine]
  SEO --> Candidate[Content candidate]
  Candidate --> Content[Content engine]
  Content --> Review[Human review]
  Review --> CMS[Directus publishing CMS]
  CMS --> Web[Astro pages]
  Web --> Signals[GSC, social, and votes]
  Signals --> SEO
```

## Ownership boundaries

| Layer | Owns | Must not own |
| --- | --- | --- |
| Astro web | rendering, metadata, Schema, UI, thin application calls | scoring policy, database secrets |
| SEO engine | intent, opportunity, cannibalization, quality, linking decisions | page rendering, social UI |
| Content engine | Briefs, prompt assembly, fact injection, draft validation | opportunity prioritization |
| Shared | generic contracts, enums, validation, utilities | industry-specific workflows |
| Supabase | durable state, tenant isolation, relations, metrics | prompt orchestration |
| Directus | reviewed page bodies, site settings, and navigation | SEO opportunity decisions, automatic publication |
| n8n | schedules and external API orchestration | canonical business rules |

## Data flow rules

1. Source facts carry provenance and remain separate from generated claims.
2. Research creates candidates, not pages.
3. SEO engine produces a decision plus an explainable reason.
4. Only approved candidates enter content creation.
5. Review promotes an editorial draft to a published Directus content record.
6. Astro renders only published Directus records or reviewed repository content.
7. Performance data updates decisions; it never silently rewrites content.

## V1 deployment shape

```text
Astro static output -> web hosting/CDN
Directus             -> reviewed editorial content and site chrome
Supabase            -> Postgres + RLS + later Auth/Realtime
n8n                 -> existing Seoul VPS or another controlled runtime
```

The web app should remain deployable without n8n. Directus is read at build
time, so a failed workflow or later CMS outage must not break deployed pages.

## Package dependency direction

```text
apps/web ------------> packages/shared
packages/seo-engine -> packages/shared
packages/content-engine -> packages/shared
```

`seo-engine` and `content-engine` should not depend on each other by default.
An application service composes their results. This keeps “should we create?”
separate from “how should it be created?”.
