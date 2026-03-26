const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contactController');
const { registerLocalizedStaticRoute } = require('../lib/i18n');
const pagesController = require('../controllers/pagesController');

registerLocalizedStaticRoute(router, '/about', pagesController.getAbout);
registerLocalizedStaticRoute(router, '/kontakti', contactController.getKontakti);
registerLocalizedStaticRoute(router, '/uslugi', pagesController.getUslugi);
registerLocalizedStaticRoute(router, '/blog/freon-ceni-2026', pagesController.getBlogFreon);
registerLocalizedStaticRoute(router, '/blog/montaz-klimatitsi', pagesController.getBlogMontaz);
registerLocalizedStaticRoute(router, '/blog/profilaktika-klimatitsi', pagesController.getBlogProfilaktika);
registerLocalizedStaticRoute(router, '/blog/inverter-vs-obiknoven', pagesController.getBlogInverter);
registerLocalizedStaticRoute(router, '/blog', pagesController.getBlogIndex);
registerLocalizedStaticRoute(router, '/error', pagesController.getError);

router.post('/kontakti', contactController.postKontakti);
router.post('/kontakti-en', contactController.postKontakti);
router.post('/kontakti-de', contactController.postKontakti);
router.post('/kontakti-ru', contactController.postKontakti);

module.exports = router;
