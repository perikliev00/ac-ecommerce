const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contactController');
const pagesController = require('../controllers/pagesController');

router.get('/about', pagesController.getAbout);
router.get('/kontakti', contactController.getKontakti);
router.post('/kontakti', contactController.postKontakti);
router.get('/uslugi', pagesController.getUslugi);
router.get('/error', pagesController.getError);

module.exports = router;
