const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

router.get('/', productController.getCardsForHome);
router.get('/produkti', productController.getCardsForCatalog);
router.get('/inverter', productController.getCardsInverter);
router.get('/hyperinverter', productController.getCardsHyperinverter);
router.get('/floor', productController.getCardsFloor);
router.get('/product/:id', productController.getProductPage);
router.get('/product', productController.redirectToCatalog);

module.exports = router;
