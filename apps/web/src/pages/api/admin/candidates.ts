import type { APIRoute } from 'astro';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getCandidates } from '@/lib/data';

export const GET: APIRoute = async ({ request }) => {
  if (!await isAdminAuthorized(request)) {
    return Response.json({ error: 'Invalid or missing admin token.' }, { status: 401 });
  }

  const candidates = await getCandidates();

  return new Response(JSON.stringify({ candidates }, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
};
