const express = require("express");

const adminController = require("../controllers/admin");
const isAdmin = require("../middleware/isAdmin");

router = express.Router();

//!GET requests
//?dashboard routes
router.get("/dash", isAdmin, adminController.getDashboard);
router.get("/dash/admin", isAdmin, adminController.getAdminDashboard);
router.get("/dash/customers", isAdmin, adminController.getCustomersDashboard);
router.get("/dash/products", isAdmin, adminController.getProductsDashboard);
router.get("/dash/orders", isAdmin, adminController.getOrdersDashboard);
router.get("/dash/sellers", isAdmin, adminController.getSellersDashboard);
router.get("/dash/add-product", isAdmin, adminController.getAddProduct);
router.get("/dash/edit-product/:id", isAdmin, adminController.getEditProduct);
router.get(
  "/dash/subscribers",
  isAdmin,
  adminController.getSubscribersDashboard
);

router.get("/dash/add-seller", isAdmin, adminController.getAddSeller);
router.get("/dash/edit-seller/:id", isAdmin, adminController.getEditSeller);

//? GET user information route
router.get("/admin/profile", isAdmin, adminController.getProfile);

//? GET admin authentication and registration routes
router.get("/dash/signUp", isAdmin, adminController.getSignUp);
router.get("/dash/signIn", adminController.getSignIn);

//!POST requests

//? POST admin authentication and registration routes
router.post("/dash/signUp", isAdmin, adminController.postSignUp);
router.post("/dash/signIn", adminController.postSignIn);

//? POST update admin information route
router.post("/admin/info", isAdmin, adminController.postUpdateAdminInfo);

//? POST delete user from dashboard route
router.post(
  "/user/delete/:id",
  isAdmin,
  adminController.postDeleteUserAccounts
);

//? POST delete seller from dashboard route
router.post("/seller/delete/:id", isAdmin, adminController.postDeleteSellers);

//? POST user delete account route
router.post(
  "/admin/delete/account",
  isAdmin,
  adminController.postDeleteAccount
);

//? POST add seller information route
router.post("/admin/add-seller", isAdmin, adminController.postAddSellerInfo);

//? POST edit seller information route
router.post(
  "/admin/edit-seller/:sellerId",
  isAdmin,
  adminController.postEditSeller
);

//? POST delete product from dashboard route
router.post("/product/delete/:id", isAdmin, adminController.postDeleteProduct);

//? POST delete subscriber from dashboard route
router.post(
  "/subscriber/delete/:id",
  isAdmin,
  adminController.postDeleteSubscriber
);

//? POST add product from dashboard route
router.post("/add/product", isAdmin, adminController.postAddProduct);
//? POST edit product from dashboard route
router.post("/edit/product/:id", isAdmin, adminController.postEditProduct);
//? POST add category from dashboard add product route
router.post("/add/category", isAdmin, adminController.postAddCategory);
//? POST delete order from dashboard route
router.post("/order/delete/:id", isAdmin, adminController.postDeleteOrder);
//? POST delete admin account from dashboard route
router.post("/admin/delete/:id", isAdmin, adminController.postDeleteAdmin);

//! GET request routes to send data as json
//? Route for retrieving user data as JSON
router.get("/users", isAdmin, adminController.getUsers);
//? Route for retrieving orders data as JSON
router.get("/order", isAdmin, adminController.getOrders);
//? Route for retrieving best selling product data as JSON
router.get("/best/selling", isAdmin, adminController.getBestSales);
//? Route for retrieving profit each month data as JSON
router.get("/profit", isAdmin, adminController.getProfit);
module.exports = router;
