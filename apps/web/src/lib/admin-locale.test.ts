import { describe, expect, it } from 'vitest';
import { adminText, getAdminLocale } from './admin-locale';

describe('admin locale', () => {
  it('defaults to Chinese and accepts English explicitly', () => {
    expect(getAdminLocale()).toBe('zh');
    expect(getAdminLocale('invalid')).toBe('zh');
    expect(getAdminLocale('en')).toBe('en');
    expect(adminText('zh', '后台', 'Admin')).toBe('后台');
  });
});
