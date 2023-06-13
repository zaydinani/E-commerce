const path = require("path");
const express = require("express");
const shopController = require("../controllers/shop");
const isLoggedIn = require("../middleware/isLoggedIn");

const router = express.Router();

//! GET ROUTES
//? user shop routes
router.get("/", shopController.getHome);
router.get("/products", shopController.getProducts);
router.get("/cart", isLoggedIn, shopController.getCart);
router.get("/contact-us", shopController.getContactUs);
router.get("/thank-you", shopController.getThankYou);
router.get("/faq", shopController.getFaq);
router.get("/wishlist", isLoggedIn, shopController.getWishlist);
router.get("/laptopStands", shopController.getLaptopStands);
router.get("/deskPads", shopController.getDeskPads);
router.get("/orders", shopController.getUsersOrder);
router.get("/product/:productId", shopController.getProduct);

//! POST ROUTES
//? POST subscribe to newsletter in footer
router.post("/subscribe", shopController.postSubscribe);
//? POST add product to cart
router.post("/add-to-cart", isLoggedIn, shopController.postAddToCart);
//? POST add product to wishlist
router.post(
  "/add-to-wishlist/:id",
  isLoggedIn,
  shopController.postAddToWishlist
);
//? POST delete product from cart
router.post(
  "/deleteProductCart",
  isLoggedIn,
  shopController.postDeleteFromCart
);
//? POST delete product from wishlist
router.post(
  "/wishlist/remove/:id",
  isLoggedIn,
  shopController.postRemoveFromWishlist
);

//? POST checkout
router.post("/checkout", isLoggedIn, shopController.postCheckout);
//? POST contact us form
router.post("/contact/form", shopController.getContactForm);

module.exports = router;
