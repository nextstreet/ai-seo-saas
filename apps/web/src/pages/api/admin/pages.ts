import type { APIRoute } from 'astro';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getAdminTenantContext } from '@/lib/admin-data';
import { mapManagedContentPage } from '@/lib/data-mappers';

export const GET: APIRoute = async ({ request }) => {
  if (!await isAdminAuthorized(request)) return Response.json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const { admin, tenant } = await getAdminTenantContext();
    const { data, error } = await admin.from('content_pages').select('*').eq('tenant_id', tenant.id).order('updated_at', { ascending: false });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ pages: (data || []).map(mapManagedContentPage) });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 503 });
  }
};
