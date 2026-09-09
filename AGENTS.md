# AI Development Instructions

This file is the entry point for Codex CLI, Trae agents, and other coding agents.

## Read first

Before changing architecture, database schema, content lifecycle, or SEO logic, read:

1. `docs/DEVELOPMENT.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DECISIONS.md`
4. The README in the package being changed

For database work, also read `docs/DATABASE.md`. For task status, read
`docs/CURRENT-SPRINT.md`.

## Non-negotiable rules

- Preserve `tenant_id` on tenant-owned data and queries.
- Keep candidate opportunities separate from published pages.
- Treat SEO as `topic/query -> intent -> page type -> brief -> page`, not
  `keyword -> article`.
- Keep industry-specific Ita Bag data out of reusable core packages.
- Put every database change in `supabase/migrations/`.
- Never expose service-role keys in browser code.
- Do not auto-publish generated content. V1 requires review.
- Do not add major infrastructure or dependencies without a concrete need.
- Preserve user changes and make the smallest coherent patch.

## Package boundaries

- `packages/seo-engine`: whether to create, expand, merge, or ignore.
- `packages/content-engine`: how an approved page should be briefed/created.
- `packages/shared`: types, schemas, constants, and generic utilities only.
- `apps/web`: Astro presentation, page rendering, and thin application wiring.
- `supabase`: durable schema, RLS, migrations, and seed data.
- `workflows`: integration definitions; never the canonical business model.

## Definition of done

Before reporting completion, run from repository root:

```bash
pnpm check
```

If a command cannot run, report the exact reason. Summarize changed files,
schema changes, tests performed, unfinished work, and risks.

## Task prompt template

```text
Read AGENTS.md and the referenced docs first.

Task:
<one bounded outcome>

Requirements:
- ...

Do not:
- ...

Acceptance criteria:
- ...

After implementation, run pnpm check and summarize changes and risks.
```
