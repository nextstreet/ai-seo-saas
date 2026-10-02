# Directus publishing CMS

Directus is the editorial publishing backend. Supabase remains the durable source
for tenant membership, topic graphs, candidates, briefs, and performance data.
Moving a candidate to `published` in Supabase does not create a public page, and
Directus only exposes records that an editor has explicitly moved to `published`.

Astro reads Directus at build time. Publishing therefore requires a site rebuild:
configure a Directus Flow that sends a `POST` request to the hosting provider's
deploy hook when a record in one of the collections below changes to
`published`. A CMS outage cannot affect an already deployed static site.

## Local self-hosted instance

The repository ships a Docker-based instance under `directus/` (requires Docker):

```bash
cd directus
cp .env.example .env   # generate KEY/SECRET and set ADMIN_* values
docker compose up -d
docker compose exec directus directus schema apply ./snapshots/2026-10-02-cms.yaml
```

The snapshot is the canonical, version-controlled data model: four collections,
their fields, and the page-to-blocks relation. After applying it, create the
read policy described below, then optionally load deterministic development
content:

```powershell
$env:DIRECTUS_ADMIN_TOKEN = "an admin static token"
node directus/seed/seed.mjs
```

## Required collections

All four collections are regular collections rather than global singletons so
that every record retains `tenant_id`. Use UUID primary keys and require the
fields marked **required**.

### `cms_sites`

| Field | Directus type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `tenant_id` | String or UUID | **Required**, unique together with `status` for published rows |
| `status` | String | **Required**; `draft`, `review`, `published`, or `archived` |
| `site_name` | String | **Required**, replaces the header brand and title suffix |
| `footer_text` | Text | **Required**, replaces the global footer |

### `cms_navigation`

| Field | Directus type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `tenant_id` | String or UUID | **Required** |
| `status` | String | **Required**; use the same lifecycle choices |
| `location` | String | **Required**; currently `header` |
| `label` | String | **Required** |
| `url` | String | **Required**; internal path or absolute URL |
| `open_in_new_tab` | Boolean | Default `false` |
| `sort` | Integer | Controls visual order |

### `cms_pages`

| Field | Directus type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `tenant_id` | String or UUID | **Required** |
| `status` | String | **Required**; `draft`, `review`, `published`, or `archived` |
| `path` | String | **Required**; canonical path such as `/guides/example/` |
| `page_type` | String | **Required**; one of the page types defined by the product model |
| `title` | String | **Required**, visible H1 |
| `seo_title` | String | Optional search title; falls back to `title` |
| `description` | Text | **Required**, meta description and summary |
| `eyebrow` | String | Optional label above the H1 |
| `lead` | Text | Optional introductory copy |
| `body_html` | WYSIWYG | Legacy free-form body; only rendered when a page has no blocks |
| `blocks` | One-to-many → `cms_blocks` | Structured content blocks, the primary editing surface |
| `primary_topic` | String | Optional human-readable topic |
| `topic_id` | String | Optional stable topic identifier |
| `related_topic_ids` | JSON | Array of stable topic identifiers |
| `published_at` | DateTime | Optional structured-data publication date |
| `date_updated` | DateTime | Directus update timestamp |
| `noindex` | Boolean | Default `false`; emits `noindex, nofollow` |

### `cms_blocks`

Blocks belong to one `cms_pages` item through a required `page` field and are
ordered by `sort`. The `block_type` discriminates which fields are used; the
Astro build normalizes every row through the Zod contract in
`packages/shared/src/cms-blocks.ts` and rejects invalid blocks.

| Field | Directus type | Used by |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `tenant_id` | String or UUID | **Required**; must match the parent page tenant |
| `sort` | Integer | Visual order |
| `page` | Many-to-one → `cms_pages` | **Required** parent page |
| `block_type` | String | **Required**; see block types below |
| `heading` | String | `heading`, `comparison`, `cta` |
| `body` | WYSIWYG | `text`, `cta` |
| `items` | JSON (list) | `options`, `steps`, `faq`, `comparison` |
| `cta_label` | String | `cta` button label |
| `cta_url` | String | `cta` target path or URL |

Block types and their `items` row shape:

| Block type | Row fields | Structured data |
| --- | --- | --- |
| `heading` | — | — |
| `text` | — | — |
| `options` | `label`, `detail` | — |
| `steps` | `name`, `text` | `HowTo` + `HowToStep` |
| `faq` | `question`, `answer` | `FAQPage` + `Question` |
| `comparison` | `dimension`, `difference` | — |
| `cta` | — (`heading`, `body`, `cta_label`, `cta_url`) | — |

Create a unique database constraint on `(tenant_id, path)`. Configure the item
editor so `draft -> review -> published` is the normal path; generated drafts
must not default to `published`. The home page uses `/`. `/custom/` and
`/guides/` replace their existing landing copy while retaining the automatic
content cards. `/studio/` remains a developer route and cannot be replaced by
CMS content.

`body_html` and block `body` fields are rendered as trusted editorial HTML.
Limit write access to trusted editors, disable script-capable markup in the
WYSIWYG configuration, and do not grant anonymous users create/update
permissions.

## Read access and environment

After applying the snapshot, create a **Static site reader** policy with
read-only item permissions on all four collections (`cms_sites`,
`cms_navigation`, `cms_pages`, `cms_blocks`), then issue a static token for a
user bound to that policy. It must never be exposed as a `PUBLIC_*` variable.
The build also applies `tenant_id` and `status=published` filters itself.

```dotenv
DIRECTUS_URL="http://localhost:8055"
DIRECTUS_TOKEN="read-only-static-token"
DIRECTUS_TENANT_ID="ita-bag-lab"
```

If public read permissions are intentionally configured, `DIRECTUS_TOKEN` may
be omitted. If all Directus variables are omitted, local reviewed Markdown and
the repository's default navigation remain active. Partial configuration fails
the build so a deployment cannot silently publish the wrong source.

Before enabling a deployment, create one published `cms_sites` row and the
desired `cms_navigation` rows for the configured tenant. Then create a draft
page, move it through review, publish it, trigger the deploy hook, and verify the
canonical URL in the generated sitemap.
