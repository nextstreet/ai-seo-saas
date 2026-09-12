import { candidates, designs, entities, galleryItems, intents, materials, products, publishedContents, tenant, topics } from './seed';
import { hasSupabaseConfig, supabase } from './supabase';
import type { CandidateContent, GalleryItem, PublishedContent } from './types';

export async function getPublishedContents(): Promise<PublishedContent[]> {
  if (!hasSupabaseConfig || !supabase) return publishedContents;

  const { data, error } = await supabase
    .from('published_contents')
    .select('*')
    .order('published_at', { ascending: false });

  if (error || !data?.length) return publishedContents;

  return data.map((item) => ({
    id: item.id,
    tenantId: item.tenant_id,
    candidateId: item.candidate_id,
    slug: item.slug,
    pageType: item.page_type,
    primaryKeyword: item.primary_keyword,
    title: item.title,
    metaDescription: item.meta_description,
    heroSummary: item.hero_summary,
    body: item.body,
    internalLinks: item.internal_links,
    publishedAt: item.published_at
  }));
}

export async function getPublishedContent(slug: string): Promise<PublishedContent | undefined> {
  const pages = await getPublishedContents();
  return pages.find((page) => page.slug === slug);
}

export async function getCandidates(): Promise<CandidateContent[]> {
  return candidates;
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (!hasSupabaseConfig || !supabase) return galleryItems;

  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('votes_count', { ascending: false });

  if (error || !data?.length) return galleryItems;

  return data.map((item) => ({
    id: item.id,
    tenantId: item.tenant_id,
    title: item.title,
    imageUrl: item.image_url,
    description: item.description,
    tags: item.tags,
    votesCount: item.votes_count
  }));
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
