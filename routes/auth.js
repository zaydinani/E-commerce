const path = require('path');
const express = require('express');

const authController = require('../controllers/auth');
const router = express.Router();
//GET user authentication and registration routes
router.get('/sign-up', authController.getSignUp);
router.get('/sign-in', authController.getSignIn);

//POST user authentication and registration routes
router.post('/sign-up', authController.postSignUp);
router.post('/sign-in', authController.postSignIn);
module.exports = router;