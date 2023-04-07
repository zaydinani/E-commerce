const path = require('path');
const express = require('express');
const authController = require('../controllers/auth');
const isLoggedIn = require('../middleware/isLoggedIn');
const router = express.Router();

//! GET requests
//? GET user authentication and registration routes
router.get('/sign-up', authController.getSignUp);
router.get('/sign-in', authController.getSignIn);
//? GET user information route
router.get('/profile', isLoggedIn, authController.getProfile);
//? GET reset passwords route
router.get('/password-reset/:token' ,authController.getNewPassword);
//? GET write email to send password resit
router.get('/email-reset' ,authController.getEmailResetPassword);

//! POST requests
//? POST user authentication and registration routes
router.post('/sign-up', authController.postSignUp);
router.post('/sign-in', authController.postSignIn);
//? POST user signOut route
router.post('/sign-out', isLoggedIn, authController.postSignOut);
//? POST user delete account route
router.post('/delete/account', isLoggedIn, authController.postDeleteAccount);
//? POST update user information route
router.post('/user/info', isLoggedIn, authController.postUpdateUserInfo)
//? POST write email to send password resit
router.post('/email-reset' ,authController.postEmailResetPassword);
//? POST New Password route
router.post('/new-password' ,authController.postNewPassword);

module.exports = router;