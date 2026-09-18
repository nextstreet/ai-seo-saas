drop policy if exists tenant_members_self_access on public.tenant_members;
create policy tenant_members_self_access on public.tenant_members
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists votes_own_insert on public.votes;
create policy votes_own_insert on public.votes
  for insert to authenticated
  with check (
    private.has_tenant_access(tenant_id)
    and user_id = (select auth.uid())
  );

drop policy if exists votes_own_delete on public.votes;
create policy votes_own_delete on public.votes
  for delete to authenticated
  using (
    private.has_tenant_access(tenant_id)
    and user_id = (select auth.uid())
  );

create index if not exists candidate_status_events_actor_user_idx
  on public.candidate_status_events (actor_user_id);
create index if not exists content_candidates_existing_page_idx
  on public.content_candidates (tenant_id, existing_page_id);
create index if not exists content_candidates_query_cluster_idx
  on public.content_candidates (tenant_id, query_cluster_id);
create index if not exists content_candidates_topic_idx
  on public.content_candidates (tenant_id, topic_id);
create index if not exists content_pages_primary_topic_idx
  on public.content_pages (tenant_id, primary_topic_id);
create index if not exists design_concepts_primary_topic_idx
  on public.design_concepts (tenant_id, primary_topic_id);
create index if not exists tenant_members_user_idx
  on public.tenant_members (user_id);
create index if not exists votes_user_idx
  on public.votes (user_id);
