const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const config = require('../lib/config');

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

    const staticUrls = [
      { loc: base + '/', path: '/' },
      { loc: base + '/produkti', path: '/produkti' },
      { loc: base + '/inverter', path: '/inverter' },
      { loc: base + '/hyperinverter', path: '/hyperinverter' },
      { loc: base + '/floor', path: '/floor' },
      { loc: base + '/about', path: '/about' },
      { loc: base + '/uslugi', path: '/uslugi' },
      { loc: base + '/kontakti', path: '/kontakti' },
    ];

    let productUrls = [];
    try {
      if (mongoose.connection.readyState === 1) {
        const docs = await Product.find({}).select('_id updatedAt createdAt').lean();
        productUrls = docs.map((p) => ({
          loc: base + '/product/' + p._id,
          lastmod: (p.updatedAt || p.createdAt) ? new Date(p.updatedAt || p.createdAt).toISOString().split('T')[0] : null,
        }));
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
