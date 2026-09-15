async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function isAdminAuthorized(request: Request) {
  const expected = process.env.ADMIN_API_TOKEN || import.meta.env.ADMIN_API_TOKEN || '';
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!expected || !supplied) return false;
  return await digest(expected) === await digest(supplied);
}
