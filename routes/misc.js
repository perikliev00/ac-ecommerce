const express = require('express');
const router = express.Router();

const miscController = require('../controllers/miscController');

router.get('/favicon.ico', miscController.getFavicon);
router.get('/favicon-32x32.png', miscController.getFavicon);
router.get('/favicon-16x16.png', miscController.getFavicon);
router.get('/apple-touch-icon.png', miscController.getFavicon);
router.get('/robots.txt', miscController.getRobots);
router.get('/sitemap.xml', miscController.getSitemap);

module.exports = router;
