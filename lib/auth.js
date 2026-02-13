/**
 * Require admin session. Redirect to /admin/login if not authenticated.
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminUserId) {
    return next();
  }
  const returnTo = req.originalUrl || '/admin';
  res.redirect('/admin/login?returnTo=' + encodeURIComponent(returnTo));
}

module.exports = { requireAdmin };
