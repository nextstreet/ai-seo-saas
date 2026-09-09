# Database Guide

## Migration rule

Every change is an ordered SQL file in `supabase/migrations/` using:

```text
YYYYMMDDHHMM_description.sql
```

Never make an untracked production-only schema change. Test migrations locally
with `supabase db reset` before applying them to a hosted project.

## Core tables

| Table | Purpose |
| --- | --- |
| `tenants` | tenant identity and lifecycle |
| `tenant_members` | user-to-tenant membership used by RLS |
| `strategy_profiles` | versioned SEO/business strategy |
| `topics` | topic/entity nodes |
| `topic_relations` | typed graph edges |
| `keywords` | normalized queries and optional metrics |
| `query_clusters` | one intent-led cluster and recommended page type |
| `query_cluster_keywords` | weighted membership of queries in a cluster |
| `content_candidates` | opportunities and decisions |
| `content_pages` | reviewed/published page records |
| `design_concepts` | reusable visual/product concepts |
| `votes` | one vote per user/design pair |

## Tenant isolation

- Tenant-owned tables contain `tenant_id` plus an index beginning with it.
- RLS is enabled even in V1.
- Policies use `private.has_tenant_access(tenant_id)`.
- Service-role access is limited to trusted workflows and server processes.
- Admin/editor/viewer differences can be tightened later; V1 first ensures no
  cross-tenant reads or writes.

Any code querying tenant data must still filter by `tenant_id`; RLS is defense
in depth, not permission to write ambiguous queries.

## Modeling choices

- JSONB is reserved for flexible configuration and snapshots, not core relations.
- Topic relationships use rows with a typed edge.
- Tenant-aware composite foreign keys prevent cross-tenant graph/page relations.
- Products, materials, features, components, and applications begin as typed
  topic entities; separate subtype tables are added only when their fields diverge.
- Candidate scores are independently stored (0–100) for explainability.
- Page body content is not forced into Postgres in V1; `content_source` records
  where reviewed content lives.
- Strategy profiles are versioned rather than overwritten without history.

## Adding a table checklist

1. Does the entity belong to a tenant?
2. Can an existing table represent it without losing meaning?
3. Are constraints and foreign-key delete behavior explicit?
4. Does it need timestamps and an `updated_at` trigger?
5. Are tenant-leading indexes present?
6. Is RLS enabled with appropriate policies?
7. Does seed data remain deterministic and non-sensitive?
