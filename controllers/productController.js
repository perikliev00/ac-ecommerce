const Product = require('../models/Product');
const Review = require('../models/Review');
const { isConnected } = require('../lib/db');
const { buildSeo, mergeJsonLd } = require('../lib/seo');

/**
 * Fetch products and convert to card shape for product-cards.ejs.
 * When DB is not connected (e.g. Atlas IP not whitelisted), render with empty products to avoid buffering timeouts.
 */

/**
 * Get cards for the homepage (e.g. "Препоръчани климатици").
 * Shows only products where recommended flag is true.
 */
async function getCardsForHome(req, res, next) {
  try {
    const seo = buildSeo({
      req,
      title: 'Климатици Несебър – Продажба, Монтаж и Сервиз | Несебър Клима',
      description: 'Продажба, монтаж и сервиз на климатици в Несебър, Слънчев бряг, Равда и Свети Влас. Професионални услуги от опитен екип.',
      jsonLd: mergeJsonLd(req),
    });
    if (!isConnected()) {
      return res.render('index', { products: [], reviews: [], ...seo });
    }
    const [productDocs, reviewDocs] = await Promise.all([
      Product.find({ recommended: true }).sort({ createdAt: -1 }).limit(12),
      Review.find().sort({ order: 1, createdAt: 1 }).lean(),
    ]);
    const products = productDocs.map((doc) => doc.toCard());
    const reviews = reviewDocs.map((r) => ({ id: r._id, name: r.name, rating: r.rating || 5, text: r.text || '' }));
    res.render('index', { products, reviews, ...seo });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all products for the catalog page (e.g. "Всички продукти"). Supports same query filters; filterOptions from all products.
 */
async function getCardsForCatalog(req, res, next) {
  try {
    if (!isConnected()) {
      const seo = buildSeo({
        req,
        title: 'Климатици Несебър – Каталог | Продажба и Монтаж | Несебър Клима',
        description: 'Каталог с климатици – инверторни, хиперинверторни и подови модели. Продажба и монтаж в Несебър, Слънчев бряг, Равда и Свети Влас.',
        canonicalPath: '/produkti',
        jsonLd: mergeJsonLd(req, {
          breadcrumbs: [
            { name: 'Начало', url: '/' },
            { name: 'Всички продукти', url: '/produkti' },
          ],
        }),
      });
      return res.render('produkti', {
        products: [],
        catalogTitle: 'Всички продукти',
        breadcrumbCurrent: 'Всички продукти',
        filterOptions: { availability: [], class: [], brand: [], moshtnost: [], energyClass: [], roomSize: [], priceMin: 0, priceMax: 10000 },
        appliedFilters: {},
        pagination: { currentPage: 1, totalPages: 1, totalCount: 0, basePath: '/produkti', queryStringWithoutPage: '' },
        CLASS_LABELS: {},
        AVAILABILITY_LABELS: {},
        ...seo,
      });
    }
    const filterQuery = buildFilterQueryAll(req.query);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const [totalCount, docs, filterOptions] = await Promise.all([
      Product.countDocuments(filterQuery),
      Product.find(filterQuery).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE),
      getFilterOptionsForCategory(null),
    ]);
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const products = docs.map((doc) => doc.toCard());
    const rawBrand = req.query.brand;
    const rawMoshtnost = req.query.moshtnost;
    const appliedFilters = {
      availability: req.query.availability || '',
      class: req.query.class || '',
      brand: Array.isArray(rawBrand) ? rawBrand : (rawBrand ? [rawBrand] : []),
      moshtnost: Array.isArray(rawMoshtnost) ? rawMoshtnost.map(String) : (rawMoshtnost !== undefined && rawMoshtnost !== '' ? [String(rawMoshtnost)] : []),
      minPrice: req.query.minPrice !== undefined ? req.query.minPrice : '',
      maxPrice: req.query.maxPrice !== undefined ? req.query.maxPrice : '',
      energyClass: req.query.energyClass || '',
      wifi: req.query.wifi || '',
      roomSize: req.query.roomSize !== undefined ? req.query.roomSize : '',
    };
    const seo = buildSeo({
      req,
      title: 'Климатици Несебър – Каталог | Продажба и Монтаж | Несебър Клима',
      description: 'Каталог с климатици – инверторни, хиперинверторни и подови модели. Продажба и монтаж в Несебър, Слънчев бряг, Равда и Свети Влас.',
      canonicalPath: '/produkti',
      jsonLd: mergeJsonLd(req, {
        breadcrumbs: [
          { name: 'Начало', url: '/' },
          { name: 'Всички продукти', url: '/produkti' },
        ],
      }),
    });
    res.render('produkti', {
      products,
      catalogTitle: 'Всички продукти',
      breadcrumbCurrent: 'Всички продукти',
      filterOptions,
      appliedFilters,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        basePath: '/produkti',
        queryStringWithoutPage: buildQueryStringWithoutPage(req.query),
      },
      CLASS_LABELS,
      AVAILABILITY_LABELS,
      ...seo,
    });
  } catch (err) {
    next(err);
  }
}

const PAGE_SIZE = 10;

/** Build query string from req.query, excluding page (for pagination links). */
function buildQueryStringWithoutPage(query) {
  const q = { ...query };
  delete q.page;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === '') continue;
    if (Array.isArray(v)) v.forEach((val) => params.append(k, val));
    else params.append(k, String(v));
  }
  return params.toString();
}

/** Labels for filter "class" values (for UI). */
const CLASS_LABELS = { visok: 'Висок клас', mezhdinen: 'Междинен клас', nachalen: 'Начален клас' };
const AVAILABILITY_LABELS = { in_stock: 'В наличност', by_order: 'С поръчка' };

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize brand list: trim, dedupe, sort so "Fuji Electric" and "Fuji Electric " show once.
 */
function normalizeBrands(brands) {
  const trimmed = (brands || []).map((b) => String(b).trim()).filter(Boolean);
  return [...new Set(trimmed)].sort();
}

/**
 * Build filter options from all products in a category (only values that exist in DB).
 * If category is null, use all products (for "Всички продукти").
 */
async function getFilterOptionsForCategory(category) {
  const baseMatch = category ? { category } : {};
  const [availability, classValues, brandsRaw, moshtnostValues, energyClasses, roomSizes, priceRange] = await Promise.all([
    Product.distinct('availability', { ...baseMatch, availability: { $in: ['in_stock', 'by_order'] } }),
    Product.distinct('class', { ...baseMatch, class: { $nin: [null, ''] } }),
    Product.distinct('brand', { ...baseMatch, brand: { $nin: [null, ''] } }),
    Product.distinct('moshtnost', { ...baseMatch, moshtnost: { $gt: 0 } }).then((a) => a.sort((x, y) => x - y)),
    Product.distinct('energyClass', { ...baseMatch, energyClass: { $nin: [null, ''] } }).then((a) => a.sort()),
    Product.distinct('roomSize', { ...baseMatch, roomSize: { $ne: null } }).then((a) => a.sort((x, y) => x - y)),
    Product.aggregate([{ $match: baseMatch }, { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]).then((r) => (r[0] ? { min: r[0].min, max: r[0].max } : { min: 0, max: 10000 })),
  ]);
  const brands = normalizeBrands(brandsRaw);
  return {
    availability: availability.filter(Boolean),
    class: classValues.filter(Boolean),
    brand: brands,
    moshtnost: moshtnostValues,
    energyClass: energyClasses,
    roomSize: roomSizes,
    priceMin: priceRange.min != null ? Math.floor(priceRange.min) : 0,
    priceMax: priceRange.max != null ? Math.ceil(priceRange.max) : 10000,
  };
}

/**
 * Build MongoDB query from request query params (all products, no category).
 */
function buildFilterQueryAll(query) {
  const q = {};
  if (query.availability && (query.availability === 'in_stock' || query.availability === 'by_order')) {
    q.availability = query.availability;
  }
  if (query.class && ['visok', 'mezhdinen', 'nachalen'].includes(query.class)) {
    q.class = query.class;
  }
  const brands = Array.isArray(query.brand) ? query.brand : (query.brand ? [query.brand] : []);
  const brandsClean = brands.map((b) => String(b).trim()).filter(Boolean);
  if (brandsClean.length) {
    q.$and = (q.$and || []).concat({
      $or: brandsClean.map((b) => ({ brand: new RegExp('^\\s*' + escapeRegex(b) + '\\s*$', 'i') })),
    });
  }
  const moshtnostArr = Array.isArray(query.moshtnost) ? query.moshtnost : (query.moshtnost !== undefined && query.moshtnost !== '' ? [query.moshtnost] : []);
  const moshtnostNums = moshtnostArr.map((m) => Number(m)).filter((n) => !Number.isNaN(n));
  if (moshtnostNums.length) q.moshtnost = moshtnostNums.length === 1 ? moshtnostNums[0] : { $in: moshtnostNums };
  const minP = query.minPrice !== undefined && query.minPrice !== '' ? Number(query.minPrice) : NaN;
  const maxP = query.maxPrice !== undefined && query.maxPrice !== '' ? Number(query.maxPrice) : NaN;
  if (!Number.isNaN(minP) || !Number.isNaN(maxP)) {
    q.price = {};
    if (!Number.isNaN(minP)) q.price.$gte = minP;
    if (!Number.isNaN(maxP)) q.price.$lte = maxP;
  }
  if (query.energyClass && String(query.energyClass).trim()) {
    q.energyClass = String(query.energyClass).trim();
  }
  if (query.wifi === '1' || query.wifi === 'true') {
    q.wifi = true;
  }
  if (query.roomSize !== undefined && query.roomSize !== '') {
    const n = Number(query.roomSize);
    if (!Number.isNaN(n)) q.roomSize = n;
  }
  return q;
}

/**
 * Build MongoDB query from request query params (for category filter).
 */
function buildFilterQuery(category, query) {
  const q = { category };
  if (query.availability && (query.availability === 'in_stock' || query.availability === 'by_order')) {
    q.availability = query.availability;
  }
  if (query.class && ['visok', 'mezhdinen', 'nachalen'].includes(query.class)) {
    q.class = query.class;
  }
  const brands = Array.isArray(query.brand) ? query.brand : (query.brand ? [query.brand] : []);
  const brandsClean = brands.map((b) => String(b).trim()).filter(Boolean);
  if (brandsClean.length) {
    q.$and = (q.$and || []).concat({
      $or: brandsClean.map((b) => ({ brand: new RegExp('^\\s*' + escapeRegex(b) + '\\s*$', 'i') })),
    });
  }
  const moshtnostArr = Array.isArray(query.moshtnost) ? query.moshtnost : (query.moshtnost !== undefined && query.moshtnost !== '' ? [query.moshtnost] : []);
  const moshtnostNums = moshtnostArr.map((m) => Number(m)).filter((n) => !Number.isNaN(n));
  if (moshtnostNums.length) q.moshtnost = moshtnostNums.length === 1 ? moshtnostNums[0] : { $in: moshtnostNums };
  const minP = query.minPrice !== undefined && query.minPrice !== '' ? Number(query.minPrice) : NaN;
  const maxP = query.maxPrice !== undefined && query.maxPrice !== '' ? Number(query.maxPrice) : NaN;
  if (!Number.isNaN(minP) || !Number.isNaN(maxP)) {
    q.price = {};
    if (!Number.isNaN(minP)) q.price.$gte = minP;
    if (!Number.isNaN(maxP)) q.price.$lte = maxP;
  }
  if (query.energyClass && String(query.energyClass).trim()) {
    q.energyClass = String(query.energyClass).trim();
  }
  if (query.wifi === '1' || query.wifi === 'true') {
    q.wifi = true;
  }
  if (query.roomSize !== undefined && query.roomSize !== '') {
    const n = Number(query.roomSize);
    if (!Number.isNaN(n)) q.roomSize = n;
  }
  return q;
}

/** Fetch products by category and render view (used by inverter / hyperinverter / floor). */
function getCardsByCategory(category, viewName, catalogTitle, breadcrumbCurrent) {
  return async (req, res, next) => {
    try {
      const categoryPath = category === 'inverter' ? '/inverter' : category === 'hyperinverter' ? '/hyperinverter' : '/floor';
      const seo = buildSeo({
        req,
        title: `${catalogTitle} Несебър – Продажба и Монтаж | Несебър Клима`,
        description: `${catalogTitle} в Несебър – професионална продажба и монтаж. Обслужваме Слънчев бряг, Равда и Свети Влас.`,
        canonicalPath: categoryPath,
        jsonLd: mergeJsonLd(req, {
          breadcrumbs: [
            { name: 'Начало', url: '/' },
            { name: catalogTitle, url: categoryPath },
          ],
        }),
      });
      if (!isConnected()) {
        return res.render(viewName, {
          products: [],
          catalogTitle,
          breadcrumbCurrent,
          filterOptions: { availability: [], class: [], brand: [], moshtnost: [], energyClass: [], roomSize: [], priceMin: 0, priceMax: 10000 },
          appliedFilters: {},
          pagination: { currentPage: 1, totalPages: 1, totalCount: 0, basePath: categoryPath, queryStringWithoutPage: '' },
          CLASS_LABELS: {},
          AVAILABILITY_LABELS: {},
          ...seo,
        });
      }
      const filterQuery = buildFilterQuery(category, req.query);
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const [totalCount, docs, filterOptions] = await Promise.all([
        Product.countDocuments(filterQuery),
        Product.find(filterQuery).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE),
        getFilterOptionsForCategory(category),
      ]);
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      const products = docs.map((doc) => doc.toCard());
      const rawBrand = req.query.brand;
      const rawMoshtnost = req.query.moshtnost;
      const appliedFilters = {
        availability: req.query.availability || '',
        class: req.query.class || '',
        brand: Array.isArray(rawBrand) ? rawBrand : (rawBrand ? [rawBrand] : []),
        moshtnost: Array.isArray(rawMoshtnost) ? rawMoshtnost.map(String) : (rawMoshtnost !== undefined && rawMoshtnost !== '' ? [String(rawMoshtnost)] : []),
        minPrice: req.query.minPrice !== undefined ? req.query.minPrice : '',
        maxPrice: req.query.maxPrice !== undefined ? req.query.maxPrice : '',
        energyClass: req.query.energyClass || '',
        wifi: req.query.wifi || '',
        roomSize: req.query.roomSize !== undefined ? req.query.roomSize : '',
      };
      res.render(viewName, {
        products,
        catalogTitle,
        breadcrumbCurrent,
        filterOptions,
        appliedFilters,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          basePath: categoryPath,
          queryStringWithoutPage: buildQueryStringWithoutPage(req.query),
        },
        CLASS_LABELS,
        AVAILABILITY_LABELS,
        ...seo,
      });
    } catch (err) {
      next(err);
    }
  };
}

const getCardsInverter = getCardsByCategory('inverter', 'inverter', 'Инверторни климатици', 'Инверторни климатици');
const getCardsHyperinverter = getCardsByCategory('hyperinverter', 'hyperinverter', 'Хиперинверторни климатици', 'Хиперинверторни климатици');
const getCardsFloor = getCardsByCategory('floor', 'floor', 'Подови климатици', 'Подови климатици');

/**
 * Single product page: fetch product from DB by ID and render full details.
 * Also loads "more" products for the recommendations section.
 */
async function getProductPage(req, res, next) {
  const id = req.params.id;
  try {
    if (!isConnected()) {
      const err = new Error('Базата данни не е налична. Опитайте отново по-късно.');
      err.status = 503;
      return next(err);
    }
    const doc = await Product.findById(id);
    if (!doc) {
      const err = new Error('Продуктът не е намерен.');
      err.status = 404;
      return next(err);
    }

    const productCard = doc.toCard();
    const rawModel = (doc.model && String(doc.model).trim()) || '';
    const rawDescription = (doc.description && String(doc.description).trim()) || '';
    const productDetails = {
      brand: doc.brand || '',
      model: rawModel,
      modelDisplay: rawModel.length > 80 ? rawModel.slice(0, 77) + '…' : rawModel,
      description: rawDescription,
      moshtnost: doc.moshtnost || null,
      class: doc.class || '',
      category: doc.category || '',
      availability: doc.availability || '',
    };

    const seoTitle = [productDetails.brand, productDetails.model].filter(Boolean).join(' ') + ' – Климатици Несебър | Несебър Клима';
    const seoDesc = `${[productDetails.brand, productDetails.model].filter(Boolean).join(' ')} – продажба, монтаж и сервиз в Несебър, Слънчев бряг, Равда и Свети Влас.`;
    const categoryPath = doc.category === 'inverter' ? '/inverter' : doc.category === 'hyperinverter' ? '/hyperinverter' : doc.category === 'floor' ? '/floor' : '/produkti';

    const seo = buildSeo({
      req,
      title: seoTitle || 'Климатик – Климатици Несебър | Несебър Клима',
      description: seoDesc || productCard.title + ' – продажба и монтаж в региона.',
      canonicalPath: '/product/' + id,
      ogType: 'product',
      jsonLd: mergeJsonLd(req, {
        breadcrumbs: [
          { name: 'Начало', url: '/' },
          { name: 'Продукти', url: '/produkti' },
          { name: productCard.title, url: '/product/' + id },
        ],
        product: { ...productCard, price: doc.price },
        productDetails,
      }),
    });

    const moreDocs = await Product.find({ _id: { $ne: id } }).limit(8);
    const moreProducts = moreDocs.map((d) => d.toCard());

    res.render('product', {
      product: productCard,
      productDetails,
      products: moreProducts,
      productCategoryPath: categoryPath,
      ...seo,
    });
  } catch (err) {
    next(err);
  }
}

function redirectToCatalog(req, res, next) {
  try {
    res.redirect('/produkti');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCardsForHome,
  getCardsForCatalog,
  getCardsInverter,
  getCardsHyperinverter,
  getCardsFloor,
  getProductPage,
  redirectToCatalog,
};
