import { candidates, designs, entities, galleryItems, intents, materials, products, publishedContents, tenant, topics } from './seed';
import { mapCandidate, mapGalleryItem, mapPublishedContent } from './data-mappers';
import { getSupabaseAdmin } from './supabase-admin';
import type { CandidateContent, GalleryItem, PublishedContent } from './types';

export function isSeedFallbackEnabled(dev = import.meta.env.DEV, explicit = process.env.ALLOW_SEED_FALLBACK || import.meta.env.ALLOW_SEED_FALLBACK) {
  return dev || String(explicit).toLowerCase() === 'true';
}

const fallback = <T>(data: T[], label: string): T[] => {
  if (isSeedFallbackEnabled()) return data;
  console.error(`[data] ${label} is unavailable and seed fallback is disabled.`);
  return [];
};

async function getTenantContext() {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const slug = import.meta.env.PUBLIC_TENANT_SLUG || 'ita-bag-lab';
  const { data, error } = await admin.from('tenants').select('id').eq('slug', slug).maybeSingle();
  if (error) {
    console.warn(`[data] Unable to resolve tenant "${slug}": ${error.message}`);
    return null;
  }
  return data ? { admin, tenantId: data.id } : null;
}

export async function getPublishedContents(): Promise<PublishedContent[]> {
  const context = await getTenantContext();
  if (!context) return fallback(publishedContents, 'Published content');

  const { data, error } = await context.admin
    .from('content_pages')
    .select('*')
    .eq('tenant_id', context.tenantId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.warn(`[data] Unable to load published content: ${error.message}`);
    return fallback(publishedContents, 'Published content');
  }

  return (data || []).map(mapPublishedContent);
}

export async function getPublishedContent(slug: string): Promise<PublishedContent | undefined> {
  const pages = await getPublishedContents();
  return pages.find((page) => page.slug === slug);
}

export async function getCandidates(): Promise<CandidateContent[]> {
  const context = await getTenantContext();
  if (!context) return fallback(candidates, 'Content candidates');

  const { data, error } = await context.admin
    .from('content_candidates')
    .select('*')
    .eq('tenant_id', context.tenantId)
    .order('opportunity_score', { ascending: false });

  if (error) {
    console.warn(`[data] Unable to load content candidates: ${error.message}`);
    return fallback(candidates, 'Content candidates');
  }

  return (data || []).map(mapCandidate);
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const context = await getTenantContext();
  if (!context) return fallback(galleryItems, 'Gallery content');

  const { data, error } = await context.admin
    .from('design_concepts')
    .select('*')
    .eq('tenant_id', context.tenantId)
    .in('status', ['voting', 'winner', 'sampling', 'produced']);

  if (error) {
    console.warn(`[data] Unable to load design concepts: ${error.message}`);
    return fallback(galleryItems, 'Gallery content');
  }

  const { data: votes, error: votesError } = await context.admin
    .from('votes')
    .select('design_concept_id')
    .eq('tenant_id', context.tenantId);
  if (votesError) console.warn(`[data] Unable to load vote totals: ${votesError.message}`);

  const totals = new Map<string, number>();
  for (const vote of votes || []) totals.set(vote.design_concept_id, (totals.get(vote.design_concept_id) || 0) + 1);

  return (data || [])
    .map((item) => mapGalleryItem(item, totals.get(item.id) || 0))
    .sort((left, right) => right.votesCount - left.votesCount);
}

export function getSystemSnapshot() {
  return {
    tenant,
    topics,
    entities,
    products,
    designs,
    materials,
    intents,
    candidates,
    publishedContents,
    galleryItems
  };
}
