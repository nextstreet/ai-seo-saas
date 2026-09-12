import type { APIRoute } from 'astro';
import { getCandidates } from '@/lib/data';

export const GET: APIRoute = async () => {
  const candidates = await getCandidates();

  return new Response(JSON.stringify({ candidates }, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
};
