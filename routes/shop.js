const path = require('path');
const express = require('express');
const shopController = require('../controllers/shop');
const isLoggedIn = require('../middleware/isLoggedIn');

const router = express.Router();


// user shop routes
router.get('/', shopController.getHome);
router.get('/products', shopController.getProducts);
router.get('/product', shopController.getProduct);
router.get('/cart', isLoggedIn,shopController.getCart);
router.get('/contact-us', shopController.getContactUs);
router.get('/faq', shopController.getFaq);
router.get('/wishlist', isLoggedIn,shopController.getWishlist);
module.exports = router;