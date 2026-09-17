import type { APIRoute } from 'astro';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { normalizeCandidateUpdate } from '@/lib/candidate-admin';
import { mapCandidate } from '@/lib/data-mappers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { CandidateContent } from '@/lib/types';

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!await isAdminAuthorized(request)) return Response.json({ error: 'Invalid or missing admin token.' }, { status: 401 });
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: 'Candidate editing requires Supabase server credentials.' }, { status: 503 });
  const tenantSlug = import.meta.env.PUBLIC_TENANT_SLUG || 'ita-bag-lab';
  const { data: tenant } = await admin.from('tenants').select('id').eq('slug', tenantSlug).maybeSingle();
  if (!tenant) return Response.json({ error: `Tenant "${tenantSlug}" was not found.` }, { status: 404 });

  const { data: current, error: readError } = await admin.from('content_candidates').select('*').eq('tenant_id', tenant.id).eq('id', params.id).maybeSingle();
  if (readError) return Response.json({ error: readError.message }, { status: 500 });
  if (!current) return Response.json({ error: 'Candidate was not found.' }, { status: 404 });

  let normalized;
  try { normalized = normalizeCandidateUpdate(await request.json(), current.status as CandidateContent['status']); }
  catch (error) { return Response.json({ error: (error as Error).message }, { status: 400 }); }

  const { data, error } = await admin.from('content_candidates').update(normalized.row).eq('tenant_id', tenant.id).eq('id', current.id).select('*').single();
  if (error) return Response.json({ error: error.message }, { status: error.code === '23505' ? 409 : 500 });
  return Response.json({ ok: true, candidate: mapCandidate(data) });
};
