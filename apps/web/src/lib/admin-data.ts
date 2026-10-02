import { getSupabaseAdmin } from './supabase-admin';

export async function getAdminTenantContext() {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase server credentials are required.');

  const tenantSlug = import.meta.env.PUBLIC_TENANT_SLUG || 'ita-bag-lab';
  const { data: tenant, error } = await admin.from('tenants').select('id, slug, name').eq('slug', tenantSlug).maybeSingle();
  if (error) throw new Error(error.message);
  if (!tenant) throw new Error(`Tenant "${tenantSlug}" was not found.`);
  return { admin, tenant };
}
