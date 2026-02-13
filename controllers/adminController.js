const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const ContactRequest = require('../models/ContactRequest');
const { isConnected } = require('../lib/db');
const { uploadProductImage } = require('../lib/upload');

/** Build plain object for Product from form body and optional uploaded file (create or update). */
function bodyToProduct(body, uploadedFilename) {
  const {
    currentOffer,
    category,
    price,
    description,
    moshtnost,
    class: cls,
    img,
    brand,
    model,
    availability,
    energyClass,
    wifi,
    roomSize,
    recommended,
  } = body;
  const imgValue = uploadedFilename || img || 'kmta-400x267.jpg.webp';
  return {
    currentOffer: currentOffer || '',
    category: category || 'inverter',
    price: price !== '' && price !== undefined ? Number(price) : 0,
    description: description || '',
    moshtnost: moshtnost !== '' && moshtnost !== undefined ? Number(moshtnost) : 0,
    class: cls || '',
    img: imgValue,
    brand: brand || '',
    model: model || '',
    availability: availability === 'in_stock' || availability === 'by_order' ? availability : '',
    energyClass: energyClass || '',
    wifi: wifi === 'on' || wifi === true || wifi === 'true',
    roomSize: roomSize !== '' && roomSize !== undefined ? Number(roomSize) : null,
    recommended: recommended === 'on' || recommended === true || recommended === 'true',
  };
}

/**
 * GET /admin – show admin panel: form to add product + list of all products from DB (edit/delete per row).
 */
async function getAdmin(req, res, next) {
  try {
    if (!isConnected()) {
      return res.render('admin', { products: [], dbOffline: true, error: req.query.error, deleted: req.query.deleted });
    }
    const docs = await Product.find().sort({ createdAt: -1 });
    const products = docs.map((d) => ({
      id: d._id,
      ...d.toCard(),
    }));
    res.render('admin', { products, dbOffline: false, error: req.query.error, deleted: req.query.deleted });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /admin/products/:id/edit – edit form for one product (prefilled from DB).
 */
async function getEditProduct(req, res, next) {
  try {
    if (!isConnected()) {
      return res.redirect('/admin?error=db');
    }
    const doc = await Product.findById(req.params.id);
    if (!doc) {
      const err = new Error('Продуктът не е намерен.');
      err.status = 404;
      return next(err);
    }
    res.render('admin-edit', { product: doc, error: req.query.error });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/products – create a new product from form body and optional image upload.
 */
async function postAddProduct(req, res, next) {
  try {
    if (!isConnected()) {
      return res.redirect('/admin?error=db');
    }
    const uploadedFilename = req.file ? req.file.filename : null;
    const doc = new Product(bodyToProduct(req.body, uploadedFilename));
    await doc.save();
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/products/:id – update existing product (from edit form); optional image upload.
 */
async function postUpdateProduct(req, res, next) {
  try {
    if (!isConnected()) {
      return res.redirect('/admin?error=db');
    }
    const uploadedFilename = req.file ? req.file.filename : null;
    const update = bodyToProduct(req.body, uploadedFilename);
    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!doc) {
      const err = new Error('Продуктът не е намерен.');
      err.status = 404;
      return next(err);
    }
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/products/:id/delete – remove the product from the database permanently.
 */
async function postDeleteProduct(req, res, next) {
  try {
    if (!isConnected()) {
      return res.redirect('/admin?error=db');
    }
    const doc = await Product.findByIdAndDelete(req.params.id);
    if (!doc) {
      const err = new Error('Продуктът не е намерен.');
      err.status = 404;
      return next(err);
    }
    res.redirect('/admin?deleted=1');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /admin/orders – list all submitted orders (customer, items, total, date).
 */
async function getAdminOrders(req, res, next) {
  try {
    if (!isConnected()) {
      return res.redirect('/admin?error=db');
    }
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.render('admin-orders', { orders, deleted: req.query.deleted });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /admin/contacts – list all contact form submissions.
 */
async function getAdminContacts(req, res, next) {
  try {
    if (!isConnected()) {
      return res.render('admin-contacts', {
        requests: [],
        dbOffline: true,
        deleted: req.query.deleted,
      });
    }

    const requests = await ContactRequest.find().sort({ createdAt: -1 }).lean();
    res.render('admin-contacts', {
      requests,
      dbOffline: false,
      deleted: req.query.deleted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/contacts/:id/delete – delete one contact request.
 */
async function postDeleteContact(req, res, next) {
  try {
    if (!isConnected()) return res.redirect('/admin/contacts?error=db');
    const doc = await ContactRequest.findByIdAndDelete(req.params.id);
    if (!doc) {
      const err = new Error('Контактната заявка не е намерена.');
      err.status = 404;
      return next(err);
    }
    res.redirect('/admin/contacts?deleted=1');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/contacts/:id/ready – toggle ready status of one contact request.
 */
async function postMarkContactReady(req, res, next) {
  try {
    if (!isConnected()) return res.redirect('/admin/contacts?error=db');
    const doc = await ContactRequest.findById(req.params.id);
    if (!doc) {
      const err = new Error('Контактната заявка не е намерена.');
      err.status = 404;
      return next(err);
    }
    doc.ready = !doc.ready;
    await doc.save();
    res.redirect('/admin/contacts');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/orders/:id/delete – delete one order.
 */
async function postDeleteOrder(req, res, next) {
  try {
    if (!isConnected()) return res.redirect('/admin/orders?error=db');
    const doc = await Order.findByIdAndDelete(req.params.id);
    if (!doc) {
      const err = new Error('Поръчката не е намерена.');
      err.status = 404;
      return next(err);
    }
    res.redirect('/admin/orders?deleted=1');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/orders/:id/ready – toggle ready status of one order.
 */
async function postMarkOrderReady(req, res, next) {
  try {
    if (!isConnected()) return res.redirect('/admin/orders?error=db');
    const doc = await Order.findById(req.params.id);
    if (!doc) {
      const err = new Error('Поръчката не е намерена.');
      err.status = 404;
      return next(err);
    }
    doc.ready = !doc.ready;
    await doc.save();
    res.redirect('/admin/orders');
  } catch (err) {
    next(err);
  }
}

/* ---------- Reviews CRUD ---------- */

async function getAdminReviews(req, res, next) {
  try {
    if (!isConnected()) {
      return res.render('admin-reviews', { reviews: [], dbOffline: true, error: req.query.error, deleted: req.query.deleted });
    }
    const reviews = await Review.find().sort({ order: 1, createdAt: 1 }).lean();
    res.render('admin-reviews', { reviews, dbOffline: false, error: req.query.error, deleted: req.query.deleted });
  } catch (err) {
    next(err);
  }
}

function getNewReview(req, res, next) {
  try {
    res.render('admin-review-edit', { review: null });
  } catch (err) {
    next(err);
  }
}

async function getEditReview(req, res, next) {
  try {
    if (!isConnected()) return res.redirect('/admin/reviews?error=db');
    const doc = await Review.findById(req.params.id);
    if (!doc) {
      const err = new Error('Отзивът не е намерен.');
      err.status = 404;
      return next(err);
    }
    res.render('admin-review-edit', { review: doc, error: req.query.error });
  } catch (err) {
    next(err);
  }
}

function handleUploadAdd(req, res, next) {
  uploadProductImage(req, res, (err) => {
    if (err) return res.redirect('/admin?error=upload');
    next();
  });
}

function handleUploadUpdate(req, res, next) {
  uploadProductImage(req, res, (err) => {
    if (err) return res.redirect('/admin/products/' + req.params.id + '/edit?error=upload');
    next();
  });
}

async function postAddReview(req, res, next) {
  try {
    if (!isConnected()) return res.redirect('/admin/reviews?error=db');
    const { name, rating, text, order } = req.body || {};
    const doc = new Review({
      name: (name || '').trim(),
      rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
      text: (text || '').trim(),
      order: parseInt(order, 10) || 0,
    });
    await doc.save();
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
}

async function postUpdateReview(req, res, next) {
  try {
    if (!isConnected()) return res.redirect('/admin/reviews?error=db');
    const { name, rating, text, order } = req.body || {};
    const doc = await Review.findByIdAndUpdate(
      req.params.id,
      {
        name: (name || '').trim(),
        rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
        text: (text || '').trim(),
        order: parseInt(order, 10) || 0,
      },
      { new: true, runValidators: true }
    );
    if (!doc) {
      const err = new Error('Отзивът не е намерен.');
      err.status = 404;
      return next(err);
    }
    res.redirect('/admin/reviews');
  } catch (err) {
    next(err);
  }
}

async function postDeleteReview(req, res, next) {
  try {
    if (!isConnected()) return res.redirect('/admin/reviews?error=db');
    const doc = await Review.findByIdAndDelete(req.params.id);
    if (!doc) {
      const err = new Error('Отзивът не е намерен.');
      err.status = 404;
      return next(err);
    }
    res.redirect('/admin/reviews?deleted=1');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdmin,
  getEditProduct,
  getNewReview,
  handleUploadAdd,
  handleUploadUpdate,
  postAddProduct,
  postUpdateProduct,
  postDeleteProduct,
  getAdminOrders,
  getAdminContacts,
  postDeleteContact,
  postMarkContactReady,
  postDeleteOrder,
  postMarkOrderReady,
  getAdminReviews,
  getEditReview,
  postAddReview,
  postUpdateReview,
  postDeleteReview,
};
