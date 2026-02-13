/**
 * Central route registration. Mount order matters: more specific paths first.
 */
function registerRoutes(app) {
  const adminRoutes = require('./admin');
  const cartRoutes = require('./cart');
  const productsRoutes = require('./products');
  const pagesRoutes = require('./pages');
  const miscRoutes = require('./misc');

  app.use('/admin', adminRoutes);
  app.use('/', cartRoutes);
  app.use('/', productsRoutes);
  app.use('/', pagesRoutes);
  app.use('/', miscRoutes);
}

module.exports = { registerRoutes };
