// Deterministic development seed for the self-hosted Directus CMS.
//
// Usage:
//   1. Create an admin static token in Data Studio (Settings -> Access Tokens).
//   2. $env:DIRECTUS_ADMIN_TOKEN="the-token"; node directus/seed/seed.mjs
//
// Idempotent: re-running updates the same fixed-id items in place.

const baseUrl = (process.env.DIRECTUS_URL ?? 'http://localhost:8055').replace(/\/$/, '');
const token = process.env.DIRECTUS_ADMIN_TOKEN;

if (!token) {
  console.error('DIRECTUS_ADMIN_TOKEN is required. Create a static admin token in Data Studio first.');
  process.exit(1);
}

const tenantId = 'ita-bag-lab';

const site = {
  id: '20000000-0000-4000-8000-000000000001',
  tenant_id: tenantId,
  status: 'published',
  site_name: 'Ita Bag Design Lab',
  footer_text: 'V1 — CMS-controlled content, human review required before publication.',
};

const navigation = [
  { id: '20000000-0000-4000-8000-000000000010', sort: 1, label: 'Custom', url: '/custom/' },
  { id: '20000000-0000-4000-8000-000000000011', sort: 2, label: 'Guides', url: '/guides/' },
  { id: '20000000-0000-4000-8000-000000000012', sort: 3, label: 'Studio', url: '/studio/' },
].map((item) => ({
  tenant_id: tenantId,
  status: 'published',
  location: 'header',
  open_in_new_tab: false,
  ...item,
}));

const page = {
  id: '20000000-0000-4000-8000-000000000100',
  tenant_id: tenantId,
  status: 'published',
  path: '/guides/from-cms/',
  page_type: 'guide',
  title: 'A CMS-controlled guide rendered from structured blocks',
  seo_title: 'Structured CMS Block Guide',
  description: 'Verify that the publishing backend controls page structure, JSON-LD, FAQ entries, and calls to action through typed content blocks.',
  eyebrow: 'CMS verification',
  lead: 'Every section of this page is a structured block authored in Directus rather than a single free-form HTML field.',
  primary_topic: 'Directus structured blocks',
  topic_id: 'cms-blocks',
  related_topic_ids: ['cms-blocks'],
  published_at: '2026-10-02T00:00:00Z',
  noindex: false,
};

const blocks = [
  {
    id: '20000000-0000-4000-8000-000000000200',
    tenant_id: tenantId,
    sort: 1,
    page: page.id,
    block_type: 'heading',
    heading: 'How block control works',
  },
  {
    id: '20000000-0000-4000-8000-000000000201',
    tenant_id: tenantId,
    sort: 2,
    page: page.id,
    block_type: 'text',
    body: '<p>The build reads only published pages, then maps each typed block to a dedicated page component and its structured-data entry.</p>',
  },
  {
    id: '20000000-0000-4000-8000-000000000202',
    tenant_id: tenantId,
    sort: 3,
    page: page.id,
    block_type: 'steps',
    items: [
      { name: 'Author', text: 'Create typed blocks in Directus.' },
      { name: 'Review', text: 'Move the page through review before publishing.' },
      { name: 'Build', text: 'Astro renders blocks and JSON-LD at build time.' },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000203',
    tenant_id: tenantId,
    sort: 4,
    page: page.id,
    block_type: 'faq',
    items: [
      { question: 'Can a draft page reach the public site?', answer: 'No. The build filter only accepts the published status.' },
      { question: 'Where do structured blocks live?', answer: 'In the cms_blocks collection, owned by a cms_pages item.' },
    ],
  },
  {
    id: '20000000-0000-4000-8000-000000000204',
    tenant_id: tenantId,
    sort: 5,
    page: page.id,
    block_type: 'cta',
    heading: 'See the developer loop',
    body: '<p>The studio page demonstrates the underlying SEO workflow.</p>',
    cta_label: 'Open Studio',
    cta_url: '/studio/',
  },
];

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${options.method ?? 'GET'} ${path} -> ${response.status}: ${detail}`);
  }
  return response.status === 204 ? null : response.json();
}

async function upsert(collection, item) {
  const { id } = item;
  try {
    await request(`/items/${collection}/${id}`, { method: 'PATCH', body: JSON.stringify(item) });
    console.log(`updated ${collection}/${id}`);
  } catch (error) {
    if (!String(error).includes('403') && !String(error).includes('404')) throw error;
    await request(`/items/${collection}`, { method: 'POST', body: JSON.stringify(item) });
    console.log(`created ${collection}/${id}`);
  }
}

await upsert('cms_sites', site);
for (const item of navigation) await upsert('cms_navigation', item);
await upsert('cms_pages', page);
for (const item of blocks) await upsert('cms_blocks', item);
console.log('Seed complete.');
