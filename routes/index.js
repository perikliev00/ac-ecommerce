/**
 * Central route registration. Mount order matters: more specific paths first.
 * Blog routes (/blog, /blog/freon-ceni-2026) are on pages router; /blog/freon-ceni-2026 is registered before /blog.
 */
function registerRoutes(app) {
  const adminRoutes = require('./admin');
  const cartRoutes = require('./cart');
  const pagesRoutes = require('./pages');
  const productsRoutes = require('./products');
  const miscRoutes = require('./misc');

  app.use('/admin', adminRoutes);
  app.use('/', cartRoutes);
  app.use('/', pagesRoutes);
  app.use('/', productsRoutes);
  app.use('/', miscRoutes);
}

module.exports = { registerRoutes };
