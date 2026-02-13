const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { requireAdmin } = require('../lib/auth');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

router.get('/', requireAdmin, adminController.getAdmin);
router.get('/orders', requireAdmin, adminController.getAdminOrders);
router.post('/orders/:id/delete', requireAdmin, adminController.postDeleteOrder);
router.post('/orders/:id/ready', requireAdmin, adminController.postMarkOrderReady);
router.get('/contacts', requireAdmin, adminController.getAdminContacts);
router.post('/contacts/:id/delete', requireAdmin, adminController.postDeleteContact);
router.post('/contacts/:id/ready', requireAdmin, adminController.postMarkContactReady);

router.get('/reviews', requireAdmin, adminController.getAdminReviews);
router.get('/reviews/new', requireAdmin, adminController.getNewReview);
router.get('/reviews/:id/edit', requireAdmin, adminController.getEditReview);
router.post('/reviews', requireAdmin, adminController.postAddReview);
router.post('/reviews/:id', requireAdmin, adminController.postUpdateReview);
router.post('/reviews/:id/delete', requireAdmin, adminController.postDeleteReview);

router.get('/products/:id/edit', requireAdmin, adminController.getEditProduct);
router.post('/products', requireAdmin, adminController.handleUploadAdd, adminController.postAddProduct);
router.post('/products/:id/delete', requireAdmin, adminController.postDeleteProduct);
router.post('/products/:id', requireAdmin, adminController.handleUploadUpdate, adminController.postUpdateProduct);

module.exports = router;
