/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_DEFAULT_LOCALE?: string;
  readonly DIRECTUS_URL?: string;
  readonly DIRECTUS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
