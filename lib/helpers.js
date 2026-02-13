function ensureAdmin(req, res, next) {
  const expected = process.env.ADMIN_KEY;
  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_KEY is not configured.' });
  }

  const incoming = req.header('x-admin-key');
  if (incoming !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

module.exports = {
  ensureAdmin
};
