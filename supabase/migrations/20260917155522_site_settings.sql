create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants(id) on delete cascade,
  tenant_slug text not null unique,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
before update on public.site_settings
for each row execute function private.set_updated_at();

alter table public.site_settings enable row level security;
revoke all on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant select, insert, update, delete on table public.site_settings to service_role;

create policy site_settings_public_read
on public.site_settings for select to anon, authenticated
using (is_active = true);

create index site_settings_tenant_active_idx
on public.site_settings (tenant_id, is_active);
