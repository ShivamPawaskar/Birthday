export function isAuthorizedAdmin(request) {
  const expected = process.env.ADMIN_KEY;
  if (!expected) {
    return { ok: false, status: 500, error: 'ADMIN_KEY is not configured.' };
  }

  const incoming = request.headers.get('x-admin-key');
  if (incoming !== expected) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  return { ok: true };
}
