import type { APIRoute } from 'astro';
import { adminSessionCookie } from '@/lib/admin-auth';

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(adminSessionCookie, { path: '/' });
  return Response.json({ ok: true });
};
