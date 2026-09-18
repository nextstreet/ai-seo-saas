import type { APIRoute } from 'astro';
import { adminLocaleCookie, getAdminLocale } from '@/lib/admin-locale';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const locale = getAdminLocale(String(form.get('locale') || ''));
  const requestedNext = String(form.get('next') || '/admin');
  const next = requestedNext.startsWith('/admin') && !requestedNext.startsWith('//') ? requestedNext : '/admin';
  cookies.set(adminLocaleCookie, locale, {
    httpOnly: true,
    sameSite: 'strict',
    secure: request.headers.get('x-forwarded-proto') === 'https' || new URL(request.url).protocol === 'https:',
    path: '/',
    maxAge: 60 * 60 * 24 * 365
  });
  return redirect(next, 303);
};
