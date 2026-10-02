import type { APIRoute } from 'astro';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getAdminTenantContext } from '@/lib/admin-data';
import { mapCandidate } from '@/lib/data-mappers';

export const GET: APIRoute = async ({ request }) => {
  if (!await isAdminAuthorized(request)) {
    return Response.json({ error: 'Invalid or missing admin token.' }, { status: 401 });
  }

  try {
    const { admin, tenant } = await getAdminTenantContext();
    const { data, error } = await admin.from('content_candidates').select('*').eq('tenant_id', tenant.id).order('opportunity_score', { ascending: false });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ candidates: (data || []).map(mapCandidate) });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 503 });
  }
};
