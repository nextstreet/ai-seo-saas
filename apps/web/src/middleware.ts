import { defineMiddleware } from 'astro:middleware';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getSiteConfig } from '@/lib/site-config';

const publicAdminPaths = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout', '/api/admin/locale']);
const routeTargets = { collection: '/collection', gallery: '/gallery', customize: '/customize', guides: '/guides' } as const;

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname.replace(/\/$/, '') || '/';
  const requestState = context.locals as Record<string, unknown>;
  if ((path.startsWith('/admin') || path.startsWith('/api/admin')) && !publicAdminPaths.has(path)) {
    if (!await isAdminAuthorized(context.request)) {
      if (path.startsWith('/api/')) return Response.json({ error: 'Authentication required.' }, { status: 401 });
      return context.redirect(`/admin/login?next=${encodeURIComponent(path)}`);
    }
  }

  if (!path.startsWith('/_') && !path.includes('.')) {
    const config = await getSiteConfig();
    for (const [key, target] of Object.entries(routeTargets)) {
      const configuredPath = config.routes[key as keyof typeof routeTargets];
      if (configuredPath === path && path !== target) {
        requestState.routeAliasRewrite = true;
        return context.rewrite(`${target}${context.url.search}`);
      }
      if (path === target && configuredPath !== target && requestState.routeAliasRewrite !== true) {
        return context.redirect(`${configuredPath}${context.url.search}`, 308);
      }
    }
  }
  return next();
});
