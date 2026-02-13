const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { buildSeo } = require('../lib/seo');

const EUR_TO_BGN = 1.95583;

function formatEur(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
function formatBgn(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' лв.';
}

function getCartFromSession(req) {
  if (!req.session) return [];
  if (!Array.isArray(req.session.cart)) {
    req.session.cart = [];
    return [];
  }
  return req.session.cart;
}

const MAX_CART_TITLE_LENGTH = 80;

/** Cart display = brand + model only (never description). Sets title and modelLabel for drawer. */
async function enrichCartWithProductTitles(cart) {
  if (!Array.isArray(cart) || cart.length === 0) return cart;
  const idStrings = cart.map((i) => (i.productId != null ? String(i.productId).trim() : '')).filter(Boolean);
  const ids = [...new Set(idStrings)];
  if (ids.length === 0) return cart;
  const objectIds = ids.filter((id) => id.length === 24 && /^[a-f0-9]+$/i.test(id)).map((id) => new mongoose.Types.ObjectId(id));
  const products = objectIds.length > 0 ? await Product.find({ _id: { $in: objectIds } }).lean() : [];
  const byId = new Map();
  products.forEach((p) => {
    if (p && p._id != null) byId.set(String(p._id), p);
  });
  return cart.map((item) => {
    const id = item.productId != null ? String(item.productId).trim() : '';
    const p = byId.get(id);
    let modelLabel = 'Продукт';
    if (p) {
      const brand = (p.brand && String(p.brand).trim()) || '';
      let model = (p.model && String(p.model).trim()) || '';
      if (model.length > 60) model = model.slice(0, 57) + '…';
      modelLabel = [brand, model].filter(Boolean).join(' ').trim() || modelLabel;
      if (modelLabel.length > MAX_CART_TITLE_LENGTH) modelLabel = modelLabel.slice(0, MAX_CART_TITLE_LENGTH - 1) + '…';
    }
    return { ...item, title: modelLabel, modelLabel };
  });
}

function buildCartPayload(cart) {
  if (!Array.isArray(cart)) return { cart: [], totalEurFormatted: '0,00 €', totalBgnFormatted: '0,00 лв.', cartCount: 0 };
  let totalEur = 0;
  const items = cart.map((item, i) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Number(item.price) || 0;
    const lineEur = price * qty;
    totalEur += lineEur;
    const lineBgn = lineEur * EUR_TO_BGN;
    const displayName = String(item.modelLabel != null ? item.modelLabel : item.title || 'Продукт');
    return {
      index: i,
      productId: String(item.productId),
      quantity: qty,
      title: displayName,
      modelLabel: displayName,
      price,
      img: item.img ? String(item.img) : 'kmta-400x267.jpg.webp',
      unitPriceFormatted: formatEur(price) + ' / ' + formatBgn(price * EUR_TO_BGN),
      lineTotalFormatted: formatEur(lineEur) + ' / ' + formatBgn(lineBgn),
    };
  });
  const totalBgn = totalEur * EUR_TO_BGN;
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return {
    cart: items,
    totalEurFormatted: formatEur(totalEur),
    totalBgnFormatted: formatBgn(totalBgn),
    cartCount,
  };
}

function wantsJson(req) {
  return req.xhr || /application\/json/i.test(String(req.get && req.get('Accept') || ''));
}

function saveSession(req, cb) {
  if (req.session && typeof req.session.save === 'function') return req.session.save(cb);
  cb();
}

// GET /cart – redirect to home (cart is in drawer only)
function getCart(req, res, next) {
  try {
    res.redirect('/');
  } catch (err) {
    next(err);
  }
}

// GET /api/cart – JSON for the slide-in drawer (same session as add/remove)
async function getCartJson(req, res, next) {
  try {
    const cart = getCartFromSession(req);
    const enriched = await enrichCartWithProductTitles(cart);
    const payload = buildCartPayload(enriched);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json');
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

// POST /cart/add
async function postAddToCart(req, res, next) {
  try {
    const productId = req.body && req.body.productId;
    const quantity = Math.max(1, parseInt(req.body && req.body.quantity, 10) || 1);
    if (!productId) {
      if (wantsJson(req)) return res.status(400).json({ error: 'Missing productId', cart: [], cartCount: 0 });
      return res.redirect('/produkti');
    }
    const product = await Product.findById(productId);
    if (!product) {
      if (wantsJson(req)) return res.status(404).json({ error: 'Product not found', cart: [], cartCount: 0 });
      return res.redirect('/produkti');
    }
    const cart = getCartFromSession(req);
    const title = [product.brand, product.model].filter(Boolean).join(' ') || 'Продукт';
    const img = product.img || 'kmta-400x267.jpg.webp';
    const price = product.price != null ? Number(product.price) : 0;
    const existing = cart.find((i) => String(i.productId) === String(productId));
    if (existing) {
      existing.quantity = (existing.quantity || 0) + quantity;
    } else {
      cart.push({
        productId: product._id.toString(),
        quantity,
        title,
        price,
        img,
      });
    }
    req.session.cart = cart;
    if (wantsJson(req)) {
      const enriched = await enrichCartWithProductTitles(cart);
      return saveSession(req, () => res.json(buildCartPayload(enriched)));
    }
    return saveSession(req, () => res.redirect(req.get('Referer') || '/'));
  } catch (err) {
    next(err);
  }
}

// POST /cart/remove (body: index)
async function postRemoveFromCart(req, res, next) {
  try {
    const cart = getCartFromSession(req);
    const index = parseInt(req.body && req.body.index, 10);
    if (Number.isInteger(index) && index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      req.session.cart = cart;
    }
    if (wantsJson(req)) {
      const enriched = await enrichCartWithProductTitles(cart);
      return saveSession(req, () => res.json(buildCartPayload(enriched)));
    }
    return saveSession(req, () => res.redirect('/'));
  } catch (err) {
    next(err);
  }
}

function cartTotals(cart) {
  let totalEur = 0;
  (cart || []).forEach((item) => { totalEur += (item.price || 0) * (item.quantity || 0); });
  return { totalEur, totalBgn: totalEur * EUR_TO_BGN };
}

// GET /checkout
async function getCheckout(req, res, next) {
  try {
    const cart = getCartFromSession(req);
    if (cart.length === 0) return res.redirect('/');
    const enriched = await enrichCartWithProductTitles(cart);
    const { totalEur, totalBgn } = cartTotals(enriched);
    const cartForDisplay = enriched.map((item) => ({
      ...item,
      title: item.modelLabel || item.title,
      lineTotalEur: (item.price || 0) * (item.quantity || 1),
      lineTotalBgn: (item.price || 0) * (item.quantity || 1) * EUR_TO_BGN,
      priceFormatted: formatEur(item.price),
      lineTotalFormatted: formatEur((item.price || 0) * (item.quantity || 1)) + ' (' + formatBgn((item.price || 0) * (item.quantity || 1) * EUR_TO_BGN) + ')',
    }));
    const seo = buildSeo({
      req,
      title: 'Поръчка | NesebarClima Несебър',
      description: 'Завършете поръчката си – NesebarClima.',
      robotsMeta: 'noindex, nofollow',
    });
    res.render('checkout', {
      cart: cartForDisplay,
      totalEurFormatted: formatEur(totalEur),
      totalBgnFormatted: formatBgn(totalBgn),
      totalEur,
      totalBgn,
      ...seo,
    });
  } catch (err) {
    next(err);
  }
}

// POST /checkout
async function postCheckout(req, res, next) {
  try {
    const cart = getCartFromSession(req);
    if (cart.length === 0) return res.redirect('/');
    const { firstName, lastName, street, city, postalCode, phone, email, comment } = req.body || {};
    const fullName = [firstName, lastName].filter(Boolean).map((s) => String(s).trim()).join(' ').trim() || (req.body && req.body.fullName) || '';
    const address = [street, city, postalCode].filter(Boolean).map((s) => String(s).trim()).join(', ').trim() || (req.body && req.body.address) || '';
    if (!fullName || !phone || !address) {
      const enriched = await enrichCartWithProductTitles(cart);
      const { totalEur, totalBgn } = cartTotals(enriched);
      const cartForDisplay = enriched.map((item) => ({
        ...item,
        title: item.modelLabel || item.title,
        lineTotalEur: (item.price || 0) * (item.quantity || 1),
        priceFormatted: formatEur(item.price),
        lineTotalFormatted: formatEur((item.price || 0) * (item.quantity || 1)) + ' (' + formatBgn((item.price || 0) * (item.quantity || 1) * EUR_TO_BGN) + ')',
      }));
      const seo = buildSeo({ req, title: 'Поръчка | NesebarClima', robotsMeta: 'noindex,nofollow' });
      return res.render('checkout', {
        error: 'Моля, попълнете име, телефон и адрес.',
        cart: cartForDisplay,
        totalEurFormatted: formatEur(totalEur),
        totalBgnFormatted: formatBgn(totalBgn),
        totalEur,
        totalBgn,
        firstName: firstName || '',
        lastName: lastName || '',
        company: (req.body && req.body.company) || '',
        country: (req.body && req.body.country) || 'България',
        street: street || '',
        city: city || '',
        postalCode: postalCode || '',
        phone: phone || '',
        email: email || '',
        comment: comment || '',
        ...seo,
      });
    }
    const { totalEur } = cartTotals(cart);
    const commentFull = [comment, email ? 'Имейл: ' + email : ''].filter(Boolean).join('; ');
    const order = new Order({
      customer: { fullName: fullName.trim(), phone: phone.trim(), address: address.trim(), comment: commentFull.trim() },
      items: cart.map((i) => ({
        productId: i.productId,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        img: i.img,
      })),
      total: totalEur,
    });
    await order.save();
    req.session.cart = [];
    res.redirect('/order-success?id=' + order._id);
  } catch (err) {
    next(err);
  }
}

async function getOrderSuccess(req, res, next) {
  try {
    const orderId = req.query && req.query.id;
    let order = null;
    if (orderId) order = await Order.findById(orderId);
    const seo = buildSeo({
      req,
      title: 'Поръчката е приета | NesebarClima Несебър',
      description: 'Благодарим ви за поръчката.',
      robotsMeta: 'noindex, nofollow',
    });
    res.render('order-success', { order, ...seo });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCart,
  getCartJson,
  postAddToCart,
  postRemoveFromCart,
  getCheckout,
  postCheckout,
  getOrderSuccess,
};
