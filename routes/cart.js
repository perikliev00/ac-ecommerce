const express = require('express');
const router = express.Router();

const { registerLocalizedStaticRoute } = require('../lib/i18n');
const cartController = require('../controllers/cartController');

registerLocalizedStaticRoute(router, '/cart', cartController.getCart);
registerLocalizedStaticRoute(router, '/api/cart', cartController.getCartJson);
router.post('/cart/add', cartController.postAddToCart);
router.post('/cart/remove', cartController.postRemoveFromCart);
router.post('/cart/add-en', cartController.postAddToCart);
router.post('/cart/add-de', cartController.postAddToCart);
router.post('/cart/add-ru', cartController.postAddToCart);
router.post('/cart/remove-en', cartController.postRemoveFromCart);
router.post('/cart/remove-de', cartController.postRemoveFromCart);
router.post('/cart/remove-ru', cartController.postRemoveFromCart);
registerLocalizedStaticRoute(router, '/checkout', cartController.getCheckout);
router.post('/checkout', cartController.postCheckout);
router.post('/checkout-en', cartController.postCheckout);
router.post('/checkout-de', cartController.postCheckout);
router.post('/checkout-ru', cartController.postCheckout);
registerLocalizedStaticRoute(router, '/order-success', cartController.getOrderSuccess);

module.exports = router;
