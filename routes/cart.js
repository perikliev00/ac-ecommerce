const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');

router.get('/cart', cartController.getCart);
router.get('/api/cart', cartController.getCartJson);
router.post('/cart/add', cartController.postAddToCart);
router.post('/cart/remove', cartController.postRemoveFromCart);
router.get('/checkout', cartController.getCheckout);
router.post('/checkout', cartController.postCheckout);
router.get('/order-success', cartController.getOrderSuccess);

module.exports = router;
