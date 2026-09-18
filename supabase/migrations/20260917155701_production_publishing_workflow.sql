create or replace function public.create_candidate_draft(
  p_tenant_id uuid,
  p_candidate_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  candidate public.content_candidates%rowtype;
  page_id uuid;
  initial_body jsonb;
begin
  if length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'a transition reason is required';
  end if;

  select * into candidate
  from public.content_candidates
  where tenant_id = p_tenant_id and id = p_candidate_id
  for update;

  if not found then raise exception 'candidate was not found'; end if;
  if candidate.status <> 'approved'::public.candidate_status then
    raise exception 'candidate must be approved before creating a draft';
  end if;
  if coalesce((candidate.quality_gate ->> 'passed')::boolean, false) is not true then
    raise exception 'candidate quality gate must pass before creating a draft';
  end if;
  if exists (
    select 1 from public.content_pages
    where tenant_id = p_tenant_id and source_candidate_id = p_candidate_id
  ) then
    raise exception 'a page already exists for this candidate';
  end if;

  select coalesce(
    jsonb_agg(jsonb_build_object('heading', section_name, 'paragraphs', '[]'::jsonb)),
    '[]'::jsonb
  ) into initial_body
  from jsonb_array_elements_text(candidate.outline) as outline(section_name);

  insert into public.content_pages (
    tenant_id, primary_topic_id, source_candidate_id, slug, title, page_type,
    primary_intent, status, canonical_url, content_source, quality_score,
    primary_keyword, meta_description, hero_summary, body, internal_links
  ) values (
    candidate.tenant_id, candidate.topic_id, candidate.id, candidate.slug,
    candidate.title, candidate.recommended_page_type, candidate.intent, 'draft',
    '/content/' || candidate.slug, 'database', candidate.quality_score,
    candidate.primary_query, candidate.meta_description, candidate.intent_summary,
    initial_body, '[]'::jsonb
  ) returning id into page_id;

  update public.content_candidates
  set status = 'draft', reason = btrim(p_reason), existing_page_id = page_id
  where tenant_id = p_tenant_id and id = p_candidate_id;

  return page_id;
end;
$$;

create or replace function public.transition_content_page(
  p_tenant_id uuid,
  p_page_id uuid,
  p_to_status text,
  p_reason text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  page_record public.content_pages%rowtype;
  candidate_record public.content_candidates%rowtype;
  target_status public.candidate_status;
begin
  if length(btrim(coalesce(p_reason, ''))) = 0 then
    raise exception 'a transition reason is required';
  end if;
  if p_to_status not in ('draft', 'review', 'published', 'refresh', 'archived') then
    raise exception 'unsupported page status: %', p_to_status;
  end if;
  target_status := p_to_status::public.candidate_status;

  select * into page_record
  from public.content_pages
  where tenant_id = p_tenant_id and id = p_page_id
  for update;

  if not found then raise exception 'page was not found'; end if;
  if page_record.source_candidate_id is null then
    raise exception 'page is not linked to a candidate';
  end if;

  select * into candidate_record
  from public.content_candidates
  where tenant_id = p_tenant_id and id = page_record.source_candidate_id
  for update;

  if not found then raise exception 'linked candidate was not found'; end if;
  if candidate_record.status::text <> page_record.status then
    raise exception 'page and candidate statuses are out of sync';
  end if;
  if not private.is_valid_candidate_transition(candidate_record.status, target_status) then
    raise exception 'invalid page status transition: % -> %', page_record.status, p_to_status;
  end if;

  if target_status = 'published' then
    if coalesce((candidate_record.quality_gate ->> 'passed')::boolean, false) is not true then
      raise exception 'candidate quality gate must pass before publication';
    end if;
    if jsonb_array_length(page_record.body) = 0 or exists (
      select 1
      from jsonb_array_elements(page_record.body) as section
      where length(btrim(coalesce(section ->> 'heading', ''))) = 0
        or case
          when jsonb_typeof(section -> 'paragraphs') = 'array' then
            jsonb_array_length(section -> 'paragraphs') = 0
            or exists (
              select 1 from jsonb_array_elements_text(section -> 'paragraphs') as paragraphs(paragraph)
              where length(btrim(paragraph)) < 40
            )
          else true
        end
    ) then
      raise exception 'every section requires a heading and paragraphs of at least 40 characters before publication';
    end if;
  end if;

  update public.content_pages
  set status = p_to_status,
      published_at = case when target_status = 'published' then coalesce(published_at, now()) else published_at end,
      content_version = case when target_status = 'published' then content_version + 1 else content_version end
  where tenant_id = p_tenant_id and id = p_page_id;

  update public.content_candidates
  set status = target_status, reason = btrim(p_reason)
  where tenant_id = p_tenant_id and id = candidate_record.id;

  return p_page_id;
end;
$$;

revoke all on function public.create_candidate_draft(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.transition_content_page(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.create_candidate_draft(uuid, uuid, text) to service_role;
grant execute on function public.transition_content_page(uuid, uuid, text, text) to service_role;
