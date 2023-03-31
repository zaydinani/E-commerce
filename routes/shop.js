const path = require('path');
const express = require('express');
const shopController = require('../controllers/shop');
const isLoggedIn = require('../middleware/isLoggedIn');

const router = express.Router();

//! GET ROUTES
//? user shop routes
router.get('/', shopController.getHome);
router.get('/products', shopController.getProducts);
router.get('/cart', isLoggedIn,shopController.getCart);
router.get('/contact-us', shopController.getContactUs);
router.get('/faq', shopController.getFaq);
router.get('/wishlist', isLoggedIn,shopController.getWishlist);


router.get('/laptopStands', shopController.getLaptopStands);
router.get('/deskPads', shopController.getDeskPads);
router.get('/product/:productId', shopController.getProduct);




//! POST ROUTES
//? subscribe to newsletter in footer
router.post('/subscribe', shopController.postSubscribe);
module.exports = router;