const express = require('express');

const adminController = require('../controllers/admin');
const isAdmin = require('../middleware/isAdmin');

router = express.Router();

//!GET requests
//?dashboard routes
router.get('/dash',isAdmin , adminController.getDashboard);
router.get('/dash/admin',isAdmin, adminController.getAdminDashboard);
router.get('/dash/customers',isAdmin, adminController.getCustomersDashboard);
router.get('/dash/products',isAdmin, adminController.getProductsDashboard);
router.get('/dash/orders',isAdmin, adminController.getOrdersDashboard);
router.get('/dash/sellers',isAdmin, adminController.getSellersDashboard);

//? GET admin authentication and registration routes
router.get('/dash/signUp',isAdmin, adminController.getSignUp);
router.get('/dash/signIn', adminController.getSignIn);

//!POST requests
//? POST admin authentication and registration routes
router.post('/dash/signUp',isAdmin, adminController.postSignUp);
router.post('/dash/signIn', adminController.postSignIn);
//? GET user information route
router.get('/admin/profile', isAdmin, adminController.getProfile);
//? POST update admin information route
router.post('/admin/info', isAdmin, adminController.postUpdateAdminInfo)
//? POST user delete account route
router.post('/admin/delete/account', isAdmin, adminController.postDeleteAccount);



module.exports = router;