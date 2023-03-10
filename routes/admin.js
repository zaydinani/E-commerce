const express = require('express');

const adminController = require('../controllers/admin');
router = express.Router();
//dashboard routes
router.get('/dash', adminController.getDashboard);
router.get('/dash/admin', adminController.getAdminDashboard);
router.get('/dash/customers', adminController.getCustomersDashboard);
router.get('/dash/products', adminController.getProductsDashboard);
router.get('/dash/orders', adminController.getOrdersDashboard);
router.get('/dash/sellers', adminController.getSellersDashboard);

module.exports = router;