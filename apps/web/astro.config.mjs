import node from '@astrojs/node';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
  integrations: [sitemap()],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
});
