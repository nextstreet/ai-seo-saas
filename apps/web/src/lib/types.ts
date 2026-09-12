export type PageType =
  | 'product'
  | 'design_inspiration'
  | 'material_guide'
  | 'intent_guide'
  | 'comparison'
  | 'gallery'
  | 'community_topic';

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  primaryDomain: string;
};

export type Topic = {
  id: string;
  tenantId: string;
  parentId?: string;
  slug: string;
  name: string;
  summary: string;
  searchIntents: string[];
  priority: number;
};

export type Entity = {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  entityType: 'product_type' | 'display_object' | 'window_shape' | 'material' | 'aesthetic' | 'use_case';
  attributes: Record<string, string | string[] | number | boolean>;
};

export type Product = {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  productType: string;
  features: string[];
  materials: string[];
  useCases: string[];
  status: 'planned' | 'sampled' | 'available';
};

export type Design = {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  aesthetic: string;
  displayObjects: string[];
  colorways: string[];
};

export type Material = {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  properties: string[];
  buyerNotes: string;
};

export type Intent = {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  stage: 'discover' | 'compare' | 'design' | 'buy' | 'post_purchase';
  requiredEvidence: string[];
  pageFit: PageType[];
};

export type QualityGate = {
  intentDifference: number;
  uniqueness: number;
  assetReadiness: number;
  cannibalizationRisk: number;
  buyerValue: number;
  passed: boolean;
  notes: string[];
};

export type CandidateContent = {
  id: string;
  tenantId: string;
  topicId: string;
  slug: string;
  pageType: PageType;
  primaryKeyword: string;
  title: string;
  metaDescription: string;
  intentSummary: string;
  outline: string[];
  opportunityScore: number;
  qualityScore: number;
  qualityGate: QualityGate;
  status: 'candidate' | 'approved' | 'rejected';
};

export type PublishedContent = {
  id: string;
  tenantId: string;
  candidateId: string;
  slug: string;
  pageType: PageType;
  primaryKeyword: string;
  title: string;
  metaDescription: string;
  heroSummary: string;
  body: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  internalLinks: Array<{ label: string; slug: string }>;
  publishedAt: string;
};

export type GalleryItem = {
  id: string;
  tenantId: string;
  title: string;
  imageUrl: string;
  description: string;
  tags: string[];
  votesCount: number;
};
