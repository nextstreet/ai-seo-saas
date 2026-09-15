import type { APIRoute } from 'astro';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getSiteConfig, normalizeSiteConfig } from '@/lib/site-config';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const GET: APIRoute = async () => Response.json({ config: await getSiteConfig() });

export const POST: APIRoute = async ({ request }) => {
  if (!await isAdminAuthorized(request)) return Response.json({ error: 'Invalid or missing admin token.' }, { status: 401 });
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: 'Supabase server credentials are not configured.' }, { status: 503 });

  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: 'Invalid JSON body.' }, { status: 400 }); }
  const config = normalizeSiteConfig(input);
  const slug = import.meta.env.PUBLIC_TENANT_SLUG || 'ita-bag-lab';
  const { data: tenantRow, error: tenantError } = await admin.from('tenants').select('id').eq('slug', slug).maybeSingle();
  if (tenantError || !tenantRow) return Response.json({ error: `Tenant "${slug}" was not found.` }, { status: 404 });

  const { error } = await admin.from('site_settings').upsert({ tenant_id: tenantRow.id, tenant_slug: slug, config, is_active: true, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, config });
};
