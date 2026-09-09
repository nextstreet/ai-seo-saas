# Local Trae + Codex CLI Workflow

## One source of truth

Use one Git repository. Trae is the daily working environment; Codex CLI edits
the same checkout. Do not maintain a second manually copied version in ChatGPT.

## First local setup

```bash
git clone <your-repository-url>
cd ai-seo-saas
corepack enable
pnpm install
cp .env.example .env
pnpm check
pnpm dev
```

For database work, install Docker and Supabase CLI, then run:

```bash
supabase start
supabase db reset
```

## Recommended task size

Give Codex one vertical outcome that can be checked in one session. A good task
includes the user-visible or developer-visible result, constraints, acceptance
criteria, and commands to run. Avoid prompts such as “finish the whole SaaS”.

## Start every Codex task with

```text
Read AGENTS.md, docs/DEVELOPMENT.md, docs/DECISIONS.md, and the relevant package
README before changing code.
```

## Example next prompt

```text
Read AGENTS.md and its referenced documents first.

Task:
Implement the tenant-scoped Topic Graph application service and a development
page that can list, create, and connect topics.

Requirements:
- Use the existing Supabase schema.
- All reads and writes must be tenant scoped.
- Validate relation types and prevent self-relations.
- Keep Ita Bag seed content out of reusable packages.

Do not:
- Add a new framework or ORM.
- Build authentication UI yet.
- change the candidate/published page separation.

Acceptance criteria:
- Topic and relation repository tests pass.
- A local developer can create two topics and connect them.
- Cross-tenant access is covered by a test.
- pnpm check passes.

Summarize changed files, schema changes, tests, unfinished work, and risks.
```

## Git rhythm

1. Create a short-lived branch for one task.
2. Ask Codex to inspect before editing.
3. Review the diff in Trae.
4. Run `pnpm check`; run `supabase db reset` for schema changes.
5. Commit only the coherent task. Suggested format:

```text
feat(topic-graph): add tenant-scoped relation service
fix(content): block invalid lifecycle transition
docs(architecture): record CMS decision
```

## Handoff format

Every Codex completion should state:

- outcome;
- changed files;
- migration/API changes;
- verification performed;
- remaining limitations;
- next safe task.
