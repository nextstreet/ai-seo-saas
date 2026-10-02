create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create type public.tenant_role as enum ('owner', 'admin', 'editor', 'viewer');
create type public.candidate_status as enum (
  'idea', 'candidate', 'approved', 'draft', 'review', 'published', 'refresh', 'archived'
);
create type public.opportunity_action as enum ('CREATE', 'EXPAND', 'MERGE', 'IGNORE');
create type public.design_status as enum ('idea', 'voting', 'winner', 'sampling', 'produced', 'archived');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_members (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.tenant_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table public.strategy_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  business_model text not null,
  primary_channels text[] not null default '{}',
  primary_intents text[] not null default '{}',
  secondary_intents text[] not null default '{}',
  low_priority_intents text[] not null default '{}',
  allowed_page_types text[] not null default '{}',
  publishing_mode text not null default 'review_required'
    check (publishing_mode in ('manual', 'review_required', 'semi_automatic')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, version)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  entity_type text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug),
  unique (tenant_id, id)
);

create table public.topic_relations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  source_topic_id uuid not null,
  target_topic_id uuid not null,
  relation_type text not null,
  weight numeric(5, 2) not null default 1 check (weight >= 0 and weight <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_topic_id <> target_topic_id),
  unique (tenant_id, source_topic_id, target_topic_id, relation_type),
  foreign key (tenant_id, source_topic_id) references public.topics(tenant_id, id) on delete cascade,
  foreign key (tenant_id, target_topic_id) references public.topics(tenant_id, id) on delete cascade
);

create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  topic_id uuid,
  query text not null,
  normalized_query text not null,
  locale text not null default 'en-US',
  intent text,
  search_volume integer check (search_volume is null or search_volume >= 0),
  cpc numeric(12, 4) check (cpc is null or cpc >= 0),
  source text,
  collected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, normalized_query, locale),
  unique (tenant_id, id),
  foreign key (tenant_id, topic_id) references public.topics(tenant_id, id) on delete set null (topic_id)
);

create table public.query_clusters (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  primary_query text not null,
  intent text not null,
  locale text not null default 'en-US',
  recommended_page_type text,
  status text not null default 'candidate' check (status in ('candidate', 'approved', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id)
);

create table public.query_cluster_keywords (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  query_cluster_id uuid not null,
  keyword_id uuid not null,
  relevance numeric(5, 2) not null default 100 check (relevance between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, query_cluster_id, keyword_id),
  foreign key (tenant_id, query_cluster_id) references public.query_clusters(tenant_id, id) on delete cascade,
  foreign key (tenant_id, keyword_id) references public.keywords(tenant_id, id) on delete cascade
);

create table public.content_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  primary_topic_id uuid,
  slug text not null,
  title text not null,
  page_type text not null,
  primary_intent text not null,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'refresh', 'archived')),
  canonical_url text,
  content_source text,
  quality_score numeric(5, 2) check (quality_score is null or quality_score between 0 and 100),
  content_version integer not null default 1 check (content_version > 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug),
  unique (tenant_id, id),
  foreign key (tenant_id, primary_topic_id) references public.topics(tenant_id, id) on delete set null (primary_topic_id)
);

create table public.content_candidates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  topic_id uuid,
  query_cluster_id uuid,
  primary_query text not null,
  intent text not null,
  recommended_page_type text not null,
  action public.opportunity_action,
  opportunity_score numeric(5, 2) check (opportunity_score is null or opportunity_score between 0 and 100),
  search_demand_score numeric(5, 2) check (search_demand_score is null or search_demand_score between 0 and 100),
  commercial_score numeric(5, 2) check (commercial_score is null or commercial_score between 0 and 100),
  uniqueness_score numeric(5, 2) check (uniqueness_score is null or uniqueness_score between 0 and 100),
  information_gain_score numeric(5, 2) check (information_gain_score is null or information_gain_score between 0 and 100),
  cannibalization_score numeric(5, 2) check (cannibalization_score is null or cannibalization_score between 0 and 100),
  existing_page_id uuid,
  reason text,
  status public.candidate_status not null default 'candidate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, topic_id) references public.topics(tenant_id, id) on delete set null (topic_id),
  foreign key (tenant_id, query_cluster_id) references public.query_clusters(tenant_id, id) on delete set null (query_cluster_id),
  foreign key (tenant_id, existing_page_id) references public.content_pages(tenant_id, id) on delete set null (existing_page_id)
);

create table public.design_concepts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  primary_topic_id uuid,
  name text not null,
  slug text not null,
  description text,
  attributes jsonb not null default '{}'::jsonb,
  status public.design_status not null default 'idea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug),
  unique (tenant_id, id),
  foreign key (tenant_id, primary_topic_id) references public.topics(tenant_id, id) on delete set null (primary_topic_id)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  design_concept_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, design_concept_id, user_id),
  foreign key (tenant_id, design_concept_id) references public.design_concepts(tenant_id, id) on delete cascade
);

create index strategy_profiles_tenant_idx on public.strategy_profiles (tenant_id, is_active);
create index topics_tenant_type_idx on public.topics (tenant_id, entity_type);
create index topic_relations_source_idx on public.topic_relations (tenant_id, source_topic_id);
create index topic_relations_target_idx on public.topic_relations (tenant_id, target_topic_id);
create index keywords_tenant_topic_idx on public.keywords (tenant_id, topic_id);
create index query_clusters_tenant_status_idx on public.query_clusters (tenant_id, status);
create index query_cluster_keywords_keyword_idx on public.query_cluster_keywords (tenant_id, keyword_id);
create index content_pages_tenant_status_idx on public.content_pages (tenant_id, status);
create index content_candidates_tenant_status_idx on public.content_candidates (tenant_id, status);
create index design_concepts_tenant_status_idx on public.design_concepts (tenant_id, status);
create index votes_design_idx on public.votes (tenant_id, design_concept_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.has_tenant_access(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tenant_members tm
    where tm.tenant_id = target_tenant_id
      and tm.user_id = auth.uid()
  );
$$;

revoke all on function private.has_tenant_access(uuid) from public;
grant execute on function private.has_tenant_access(uuid) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tenants', 'tenant_members', 'strategy_profiles', 'topics', 'topic_relations',
    'keywords', 'query_clusters', 'query_cluster_keywords', 'content_pages',
    'content_candidates', 'design_concepts', 'votes'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;

alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.strategy_profiles enable row level security;
alter table public.topics enable row level security;
alter table public.topic_relations enable row level security;
alter table public.keywords enable row level security;
alter table public.query_clusters enable row level security;
alter table public.query_cluster_keywords enable row level security;
alter table public.content_pages enable row level security;
alter table public.content_candidates enable row level security;
alter table public.design_concepts enable row level security;
alter table public.votes enable row level security;

create policy tenants_member_access on public.tenants
  for select to authenticated
  using (private.has_tenant_access(id));

create policy tenant_members_self_access on public.tenant_members
  for select to authenticated
  using (user_id = auth.uid());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'strategy_profiles', 'topics', 'topic_relations', 'keywords', 'query_clusters',
    'query_cluster_keywords', 'content_pages', 'content_candidates',
    'design_concepts'
  ]
  loop
    execute format(
      'create policy tenant_member_all on public.%I for all to authenticated using (private.has_tenant_access(tenant_id)) with check (private.has_tenant_access(tenant_id))',
      table_name
    );
  end loop;
end;
$$;

create policy votes_tenant_read on public.votes
  for select to authenticated
  using (private.has_tenant_access(tenant_id));

create policy votes_own_insert on public.votes
  for insert to authenticated
  with check (private.has_tenant_access(tenant_id) and user_id = auth.uid());

create policy votes_own_delete on public.votes
  for delete to authenticated
  using (private.has_tenant_access(tenant_id) and user_id = auth.uid());
