alter table public.content_pages
  add column source_candidate_id uuid,
  add column primary_keyword text,
  add column meta_description text,
  add column hero_summary text,
  add column body jsonb not null default '[]'::jsonb,
  add column internal_links jsonb not null default '[]'::jsonb;

update public.content_pages
set primary_keyword = coalesce(primary_keyword, title),
    meta_description = coalesce(meta_description, title),
    hero_summary = coalesce(hero_summary, title)
where primary_keyword is null
   or meta_description is null
   or hero_summary is null;

alter table public.content_pages
  alter column primary_keyword set not null,
  alter column meta_description set not null,
  alter column hero_summary set not null,
  add constraint content_pages_body_is_array check (jsonb_typeof(body) = 'array'),
  add constraint content_pages_internal_links_is_array check (jsonb_typeof(internal_links) = 'array'),
  add constraint content_pages_source_candidate_fk
    foreign key (tenant_id, source_candidate_id)
    references public.content_candidates(tenant_id, id) on delete set null;

create unique index content_pages_source_candidate_idx
  on public.content_pages (tenant_id, source_candidate_id)
  where source_candidate_id is not null;

alter table public.content_candidates
  add column slug text,
  add column title text,
  add column meta_description text,
  add column intent_summary text,
  add column outline jsonb not null default '[]'::jsonb,
  add column quality_score numeric(5, 2)
    check (quality_score is null or quality_score between 0 and 100),
  add column quality_gate jsonb not null default '{}'::jsonb;

update public.content_candidates
set slug = coalesce(
      slug,
      trim(both '-' from regexp_replace(lower(primary_query), '[^a-z0-9]+', '-', 'g'))
    ),
    title = coalesce(title, initcap(primary_query)),
    meta_description = coalesce(meta_description, reason, primary_query),
    intent_summary = coalesce(intent_summary, reason, intent)
where slug is null
   or title is null
   or meta_description is null
   or intent_summary is null;

alter table public.content_candidates
  alter column slug set not null,
  alter column title set not null,
  alter column meta_description set not null,
  alter column intent_summary set not null,
  add constraint content_candidates_outline_is_array check (jsonb_typeof(outline) = 'array'),
  add constraint content_candidates_quality_gate_is_object check (jsonb_typeof(quality_gate) = 'object');

create index content_candidates_tenant_slug_idx
  on public.content_candidates (tenant_id, slug);

grant select, insert, update, delete on table public.tenants to service_role;
grant select, insert, update, delete on table public.content_pages to service_role;
grant select, insert, update, delete on table public.content_candidates to service_role;
grant select, insert, update, delete on table public.design_concepts to service_role;
grant select, insert, update, delete on table public.votes to service_role;
