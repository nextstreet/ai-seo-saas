import type { APIRoute } from 'astro';
import { adminSessionCookie, createAdminSession, validateAdminCredentials } from '@/lib/admin-auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return Response.json({ error: 'Admin login is not configured.' }, { status: 503 });
  }

  let input: { username?: string; password?: string };
  try { input = await request.json(); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (!await validateAdminCredentials(input.username || '', input.password || '')) {
    return Response.json({ error: 'Incorrect account or password.' }, { status: 401 });
  }

  cookies.set(adminSessionCookie, await createAdminSession(input.username || ''), {
    httpOnly: true,
    sameSite: 'strict',
    secure: request.headers.get('x-forwarded-proto') === 'https' || new URL(request.url).protocol === 'https:',
    path: '/',
    maxAge: 60 * 60 * 12
  });
  return Response.json({ ok: true });
};
