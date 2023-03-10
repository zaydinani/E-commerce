const path = require('path');
const express = require('express');

const authController = require('../controllers/auth');
const router = express.Router();
// user authentication and registration routes
router.get('/sign-up', authController.getSignUp);
router.get('/sign-in', authController.getSignIn);


module.exports = router;