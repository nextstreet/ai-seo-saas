import type { APIRoute } from 'astro';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getAdminTenantContext } from '@/lib/admin-data';
import { normalizePageTransition } from '@/lib/page-admin';
import type { ContentPageStatus } from '@/lib/types';

export const POST: APIRoute = async ({ request, params }) => {
  if (!await isAdminAuthorized(request)) return Response.json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const { admin, tenant } = await getAdminTenantContext();
    const { data: page, error: readError } = await admin.from('content_pages').select('status').eq('tenant_id', tenant.id).eq('id', params.id).maybeSingle();
    if (readError) return Response.json({ error: readError.message }, { status: 500 });
    if (!page) return Response.json({ error: 'Page was not found.' }, { status: 404 });
    const transition = normalizePageTransition(await request.json(), page.status as ContentPageStatus);
    const { error } = await admin.rpc('transition_content_page', { p_tenant_id: tenant.id, p_page_id: params.id, p_to_status: transition.status, p_reason: transition.reason });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ ok: true, status: transition.status });
  } catch (error) { return Response.json({ error: (error as Error).message }, { status: 400 }); }
};
