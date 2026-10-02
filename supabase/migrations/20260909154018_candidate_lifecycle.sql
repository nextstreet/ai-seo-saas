alter table public.content_candidates
  add constraint content_candidates_tenant_id_id_key unique (tenant_id, id);

create table public.candidate_status_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  candidate_id uuid not null,
  from_status public.candidate_status,
  to_status public.candidate_status not null,
  reason text not null check (length(btrim(reason)) > 0),
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, candidate_id)
    references public.content_candidates(tenant_id, id) on delete cascade
);

create index candidate_status_events_tenant_candidate_idx
  on public.candidate_status_events (tenant_id, candidate_id, created_at);

create or replace function private.is_valid_candidate_transition(
  from_status public.candidate_status,
  to_status public.candidate_status
)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select case from_status
    when 'idea' then to_status in ('candidate', 'archived')
    when 'candidate' then to_status in ('approved', 'archived')
    when 'approved' then to_status in ('draft', 'archived')
    when 'draft' then to_status in ('review', 'archived')
    when 'review' then to_status in ('draft', 'published', 'archived')
    when 'published' then to_status in ('refresh', 'archived')
    when 'refresh' then to_status in ('draft', 'archived')
    when 'archived' then false
  end;
$$;

create or replace function private.validate_candidate_transition()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status <> old.status then
    if not private.is_valid_candidate_transition(old.status, new.status) then
      raise exception 'invalid candidate status transition: % -> %', old.status, new.status;
    end if;
    if new.reason is null
       or length(btrim(new.reason)) = 0
       or new.reason is not distinct from old.reason then
      raise exception 'a new transition reason is required';
    end if;
  end if;
  return new;
end;
$$;

create trigger validate_candidate_transition
before update of status on public.content_candidates
for each row execute function private.validate_candidate_transition();

alter table public.candidate_status_events enable row level security;

create policy candidate_status_events_member_read
on public.candidate_status_events
for select
to authenticated
using (private.has_tenant_access(tenant_id));

create or replace function private.record_candidate_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> old.status then
    insert into public.candidate_status_events (
      tenant_id, candidate_id, from_status, to_status, reason, actor_user_id
    ) values (
      new.tenant_id, new.id, old.status, new.status, new.reason, auth.uid()
    );
  end if;
  return new;
end;
$$;

revoke all on function private.record_candidate_transition() from public;

create trigger record_candidate_transition
after update of status on public.content_candidates
for each row execute function private.record_candidate_transition();
