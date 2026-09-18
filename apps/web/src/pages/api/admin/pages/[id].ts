import type { APIRoute } from 'astro';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getAdminTenantContext } from '@/lib/admin-data';
import { mapManagedContentPage } from '@/lib/data-mappers';
import { normalizePageUpdate } from '@/lib/page-admin';

const authorized = (request: Request) => isAdminAuthorized(request);

export const GET: APIRoute = async ({ request, params }) => {
  if (!await authorized(request)) return Response.json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const { admin, tenant } = await getAdminTenantContext();
    const { data, error } = await admin.from('content_pages').select('*').eq('tenant_id', tenant.id).eq('id', params.id).maybeSingle();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!data) return Response.json({ error: 'Page was not found.' }, { status: 404 });
    return Response.json({ page: mapManagedContentPage(data) });
  } catch (error) { return Response.json({ error: (error as Error).message }, { status: 503 }); }
};

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!await authorized(request)) return Response.json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const row = normalizePageUpdate(await request.json());
    const { admin, tenant } = await getAdminTenantContext();
    const { data, error } = await admin.from('content_pages').update(row).eq('tenant_id', tenant.id).eq('id', params.id).select('*').maybeSingle();
    if (error) return Response.json({ error: error.message }, { status: error.code === '23505' ? 409 : 500 });
    if (!data) return Response.json({ error: 'Page was not found.' }, { status: 404 });
    return Response.json({ ok: true, page: mapManagedContentPage(data) });
  } catch (error) { return Response.json({ error: (error as Error).message }, { status: 400 }); }
};
