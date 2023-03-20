const path = require('path');
const express = require('express');
const authController = require('../controllers/auth');
const isLoggedIn = require('../middleware/isLoggedIn');
const router = express.Router();

//!GET user authentication and registration routes
router.get('/sign-up', authController.getSignUp);
router.get('/sign-in', authController.getSignIn);

//!POST user authentication and registration routes
router.post('/sign-up', authController.postSignUp);
router.post('/sign-in', authController.postSignIn);

//!POST user signOut route
router.post('/sign-out', isLoggedIn,authController.postSignOut);

//!POST user delete account route
router.post('/delete/account', isLoggedIn,authController.postDeleteAccount);

//! get user information route
router.get('/profile', isLoggedIn,authController.getProfile);

//! POST update user information route
router.post('/user/info', isLoggedIn,authController.postUpdateUserInfo)
module.exports = router;