export type AdminLocale = 'zh' | 'en';

export const adminLocaleCookie = 'admin_locale';

export function getAdminLocale(value?: string): AdminLocale {
  return value === 'en' ? 'en' : 'zh';
}

export function adminText(locale: AdminLocale, chinese: string, english: string) {
  return locale === 'zh' ? chinese : english;
}
