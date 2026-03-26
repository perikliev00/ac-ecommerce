const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const config = require('../lib/config');
const { SUPPORTED_LOCALES, localizePath } = require('../lib/i18n');

const FAVICON_PATH = path.join(__dirname, '..', 'public', 'assets', 'logos', 'logonsclima.png');

function getFavicon(req, res, next) {
  try {
    res.type('image/png');
    res.sendFile(FAVICON_PATH);
  } catch (err) {
    next(err);
  }
}

function getRobots(req, res, next) {
  try {
    const protocol = req.protocol || 'https';
const host = req.get('host') || config.DEFAULT_HOST;
  const base = `${protocol}://${host}`;
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart
Disallow: /checkout
Disallow: /order-success

Sitemap: ${base}/sitemap.xml
`;
    res.type('text/plain').send(body);
  } catch (err) {
    next(err);
  }
}

async function getSitemap(req, res, next) {
  try {
    const protocol = req.protocol || 'https';
    const host = req.get('host') || config.DEFAULT_HOST;
    const base = `${protocol}://${host}`;

    const baseStaticPaths = [
      '/',
      '/produkti',
      '/inverter',
      '/hyperinverter',
      '/floor',
      '/about',
      '/uslugi',
      '/blog',
      '/blog/freon-ceni-2026',
      '/blog/montaz-klimatitsi',
      '/blog/profilaktika-klimatitsi',
      '/blog/inverter-vs-obiknoven',
      '/kontakti',
    ];
    const staticUrls = SUPPORTED_LOCALES.flatMap((locale) => {
      return baseStaticPaths.map((pagePath) => ({
        loc: base + localizePath(pagePath, locale),
        path: localizePath(pagePath, locale),
      }));
    });

    let productUrls = [];
    try {
      if (mongoose.connection.readyState === 1) {
        const docs = await Product.find({}).select('_id updatedAt createdAt').lean();
        productUrls = docs.flatMap((p) => {
          return SUPPORTED_LOCALES.map((locale) => ({
            loc: base + localizePath('/product/' + p._id, locale),
            lastmod: (p.updatedAt || p.createdAt) ? new Date(p.updatedAt || p.createdAt).toISOString().split('T')[0] : null,
          }));
        });
      }
    } catch (_) { /* ignore */ }

    const urlNodes = staticUrls.map((u) => {
      return `  <url>\n    <loc>${u.loc}</loc>\n  </url>`;
    }).join('\n') + productUrls.map((u) => {
      return `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>`;

    res.type('application/xml').send(xml);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFavicon,
  getRobots,
  getSitemap,
};
