import { afterEach, describe, expect, it } from 'vitest';
import { createAdminSession, validateAdminCredentials, verifyAdminSession } from './admin-auth';

const original = { ...process.env };

afterEach(() => {
  process.env.ADMIN_USERNAME = original.ADMIN_USERNAME;
  process.env.ADMIN_PASSWORD = original.ADMIN_PASSWORD;
  process.env.ADMIN_SESSION_SECRET = original.ADMIN_SESSION_SECRET;
});

describe('admin authentication', () => {
  it('validates configured credentials and signs a session', async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'correct-password';
    process.env.ADMIN_SESSION_SECRET = 'a-long-local-test-secret';

    expect(await validateAdminCredentials('admin', 'correct-password')).toBe(true);
    expect(await validateAdminCredentials('admin', 'wrong-password')).toBe(false);
    expect(await verifyAdminSession(await createAdminSession('admin'))).toBe(true);
  });

  it('rejects a modified session', async () => {
    process.env.ADMIN_SESSION_SECRET = 'a-long-local-test-secret';
    const session = await createAdminSession('admin');
    expect(await verifyAdminSession(`${session}changed`)).toBe(false);
  });
});
