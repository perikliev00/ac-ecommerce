const express = require('express');
const router = express.Router();

const { registerLocalizedStaticRoute } = require('../lib/i18n');
const productController = require('../controllers/productController');

registerLocalizedStaticRoute(router, '/', productController.getCardsForHome);
registerLocalizedStaticRoute(router, '/produkti', productController.getCardsForCatalog);
registerLocalizedStaticRoute(router, '/inverter', productController.getCardsInverter);
registerLocalizedStaticRoute(router, '/hyperinverter', productController.getCardsHyperinverter);
registerLocalizedStaticRoute(router, '/floor', productController.getCardsFloor);
router.get('/product/:id', productController.getProductPage);
router.get('/product/:id-en', productController.getProductPage);
router.get('/product/:id-de', productController.getProductPage);
router.get('/product/:id-ru', productController.getProductPage);
router.get('/product', productController.redirectToCatalog);
router.get('/product-en', productController.redirectToCatalog);
router.get('/product-de', productController.redirectToCatalog);
router.get('/product-ru', productController.redirectToCatalog);

module.exports = router;
