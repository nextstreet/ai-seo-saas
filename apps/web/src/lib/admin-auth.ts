export const adminSessionCookie = 'ita_admin_session';
const sessionLifetime = 60 * 60 * 12;

const env = (name: string) => process.env[name] || '';

async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hmac(value: string) {
  const secret = env('ADMIN_SESSION_SECRET');
  if (!secret) return '';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function equal(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([digest(left), digest(right)]);
  return leftHash === rightHash;
}

export async function validateAdminCredentials(username: string, password: string) {
  const expectedUsername = env('ADMIN_USERNAME');
  const expectedPassword = env('ADMIN_PASSWORD');
  if (!expectedUsername || !expectedPassword) return false;
  const [usernameMatches, passwordMatches] = await Promise.all([
    equal(username, expectedUsername),
    equal(password, expectedPassword)
  ]);
  return usernameMatches && passwordMatches;
}

export async function createAdminSession(username: string) {
  const expires = Math.floor(Date.now() / 1000) + sessionLifetime;
  const payload = `${encodeURIComponent(username)}.${expires}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyAdminSession(token: string) {
  const [username, expiresValue, signature] = token.split('.');
  if (!username || !expiresValue || !signature || Number(expiresValue) <= Math.floor(Date.now() / 1000)) return false;
  const payload = `${username}.${expiresValue}`;
  const expected = await hmac(payload);
  return Boolean(expected) && await equal(signature, expected);
}

function cookie(request: Request, name: string) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return '';
}

export async function isAdminAuthorized(request: Request) {
  const expected = process.env.ADMIN_API_TOKEN || import.meta.env.ADMIN_API_TOKEN || '';
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (expected && supplied && await equal(expected, supplied)) return true;
  return verifyAdminSession(cookie(request, adminSessionCookie));
}
