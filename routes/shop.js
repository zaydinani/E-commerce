const path = require('path');
const express = require('express');

const shopController = require('../controllers/shop');
const router = express.Router();


// user shop routes
router.get('/', shopController.getHome);
router.get('/products', shopController.getProducts);
router.get('/product', shopController.getProduct);
router.get('/cart', shopController.getCart);
router.get('/contact-us', shopController.getContactUs);
router.get('/faq', shopController.getFaq);

router.get('/profile', shopController.getProfile);
router.get('/wishlist', shopController.getWishlist);
module.exports = router;