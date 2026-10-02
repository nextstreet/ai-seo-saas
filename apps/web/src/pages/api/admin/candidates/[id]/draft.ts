import type { APIRoute } from 'astro';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getAdminTenantContext } from '@/lib/admin-data';

export const POST: APIRoute = async ({ request, params }) => {
  if (!await isAdminAuthorized(request)) return Response.json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const input = await request.json() as { reason?: unknown };
    const reason = typeof input.reason === 'string' ? input.reason.trim().slice(0, 500) : '';
    if (!reason) return Response.json({ error: 'A transition reason is required.' }, { status: 400 });
    const { admin, tenant } = await getAdminTenantContext();
    const { data, error } = await admin.rpc('create_candidate_draft', { p_tenant_id: tenant.id, p_candidate_id: params.id, p_reason: reason });
    if (error) return Response.json({ error: error.message }, { status: error.code === '23505' ? 409 : 400 });
    return Response.json({ ok: true, pageId: data });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 503 });
  }
};
