/**
 * Centralized SEO meta generation for NesebarClima.
 * Bulgarian local search targets: климатици несебър, слънчев бряг, равда, свети влас, продажба, монтаж, сервиз
 */

const config = require('./config');

const SITE_NAME = 'Несебър Клима';
const SITE_NAME_EN = 'NesebarClima';
const DEFAULT_PHONE = '+359 899 123 123';
const AREAS_SERVED = ['Несебър', 'Слънчев бряг', 'Равда', 'Свети Влас'];

/**
 * Build absolute base URL from request.
 */
function getBaseUrl(req) {
  const protocol = req.protocol || 'https';
  const host = req.get && req.get('host') ? req.get('host') : config.DEFAULT_HOST;
  return `${protocol}://${host}`;
}

/**
 * Build absolute canonical URL for a path.
 */
function getCanonicalUrl(req, path) {
  const base = getBaseUrl(req);
  const cleanPath = (path || req.path || '/').replace(/\/+/g, '/');
  return base + (cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath);
}

/**
 * Build absolute URL for static assets (logo, OG image).
 */
function getAssetUrl(req, assetPath) {
  const base = getBaseUrl(req);
  return base + (assetPath.startsWith('/') ? assetPath : '/' + assetPath);
}

/**
 * Default OG image for social sharing (Facebook, Messenger, X, LinkedIn).
 * Same as the header logo so link previews show the site logo.
 */
const DEFAULT_OG_IMAGE = '/assets/logos/logonsclima.png';

/**
 * Generate SEO meta object for res.locals / render.
 * @param {Object} opts - { req, title, description, canonicalPath, ogImage, robotsMeta, jsonLd, breadcrumbs }
 */
function buildSeo(opts) {
  const req = opts.req;
  const baseUrl = getBaseUrl(req);

  const title = opts.title || `${SITE_NAME} – Климатици Несебър | ${SITE_NAME_EN}`;
  const description = opts.description || `Магазин и сервиз за климатици в Несебър. Продажба, монтаж и сервиз в Несебър, Слънчев бряг, Равда и Свети Влас.`;
  const canonicalUrl = opts.canonicalPath != null
    ? baseUrl + (opts.canonicalPath.startsWith('/') ? opts.canonicalPath : '/' + opts.canonicalPath)
    : getCanonicalUrl(req);
  // Use header logo for all shares unless a page explicitly passes ogImage (e.g. future product image)
  const ogImage = opts.ogImage
    ? (opts.ogImage.startsWith('http') ? opts.ogImage : baseUrl + (opts.ogImage.startsWith('/') ? opts.ogImage : '/' + opts.ogImage))
    : getAssetUrl(req, DEFAULT_OG_IMAGE);
  const robotsMeta = opts.robotsMeta != null ? opts.robotsMeta : 'index,follow';
  const themeColor = opts.themeColor || '#1a365d';

  const result = {
    title,
    description,
    canonicalUrl,
    ogImage,
    robotsMeta,
    themeColor,
    ogLocale: 'bg_BG',
    ogSiteName: SITE_NAME,
    ogType: opts.ogType || 'website',
  };

  if (opts.jsonLd && Array.isArray(opts.jsonLd) && opts.jsonLd.length) {
    result.jsonLd = opts.jsonLd;
  } else if (opts.jsonLd && typeof opts.jsonLd === 'object') {
    result.jsonLd = [opts.jsonLd];
  } else {
    result.jsonLd = [];
  }

  return result;
}

/**
 * Build sitewide LocalBusiness JSON-LD.
 */
function buildLocalBusinessJsonLd(req) {
  const baseUrl = getBaseUrl(req);
  const logoUrl = baseUrl + DEFAULT_OG_IMAGE;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: baseUrl + '/',
    telephone: DEFAULT_PHONE,
    areaServed: AREAS_SERVED.map((name) => ({ '@type': 'City', name })),
    image: logoUrl,
    description: 'Продажба, монтаж и сервиз на климатици в Несебър, Слънчев бряг, Равда и Свети Влас.',
  };
}

/**
 * Build BreadcrumbList JSON-LD from breadcrumb items.
 * @param {Object} req
 * @param {Array} items - [{ name, url }]
 */
function buildBreadcrumbJsonLd(req, items) {
  if (!items || items.length === 0) return null;
  const baseUrl = getBaseUrl(req);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : baseUrl + (item.url.startsWith('/') ? item.url : '/' + item.url),
    })),
  };
}

/**
 * Build Product JSON-LD for a product page.
 */
function buildProductJsonLd(req, product, productDetails) {
  const baseUrl = getBaseUrl(req);
  const productUrl = baseUrl + '/product/' + (product.id || product._id);
  const imagePath = (product.img || 'kmta-400x267.jpg.webp');
  const imageUrl = baseUrl + '/assets/images/' + imagePath;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title || [productDetails?.brand, productDetails?.model].filter(Boolean).join(' ') || 'Климатик',
    description: productDetails?.description || product.title || `Климатик – продажба и монтаж в Несебър и региона.`,
    image: imageUrl,
    url: productUrl,
  };

  if (productDetails?.brand) {
    schema.brand = { '@type': 'Brand', name: productDetails.brand };
  }

  const priceNum = product.price != null ? Number(String(product.price).replace(/[^\d,.-]/g, '').replace(',', '.')) : null;
  if (priceNum != null && !Number.isNaN(priceNum)) {
    const priceBgn = priceNum * 1.95583;
    schema.offers = {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BGN',
      price: Math.round(priceBgn * 100) / 100,
      availability: productDetails?.availability === 'in_stock'
        ? 'https://schema.org/InStock'
        : productDetails?.availability === 'by_order'
          ? 'https://schema.org/PreOrder'
          : 'https://schema.org/InStock',
    };
  }

  return schema;
}

/**
 * Merge LocalBusiness + optional BreadcrumbList + optional Product into jsonLd array.
 */
function mergeJsonLd(req, options = {}) {
  const arr = [];
  if (options.includeLocalBusiness !== false) {
    arr.push(buildLocalBusinessJsonLd(req));
  }
  if (options.breadcrumbs && options.breadcrumbs.length) {
    const bc = buildBreadcrumbJsonLd(req, options.breadcrumbs);
    if (bc) arr.push(bc);
  }
  if (options.product) {
    arr.push(buildProductJsonLd(req, options.product, options.productDetails || {}));
  }
  return arr;
}

module.exports = {
  buildSeo,
  getBaseUrl,
  getCanonicalUrl,
  getAssetUrl,
  buildLocalBusinessJsonLd,
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  mergeJsonLd,
  SITE_NAME,
  SITE_NAME_EN,
  DEFAULT_OG_IMAGE,
  AREAS_SERVED,
};
