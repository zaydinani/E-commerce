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

//! GET request routes to send data as json
//? Route for retrieving user data as JSON
router.get("/users", isAdmin, adminController.getUsers);
//? Route for retrieving orders data as JSON
router.get("/orders", isAdmin, adminController.getOrders);
//? Route for retrieving best selling product data as JSON
router.get("/best/selling", isAdmin, adminController.getBestSales);
//? Route for retrieving profit each month data as JSON
router.get("/profit", isAdmin, adminController.getProfit);
module.exports = router;
