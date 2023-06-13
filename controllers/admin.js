const orderModel = require("../models/order");
const productModel = require("../models/products");
const userModel = require("../models/user");
const subscribersModel = require("../models/subscribers");
const adminModel = require("../models/admin");
const sellersModel = require("../models/sellers");
const categoryModel = require("../models/categories");
const NodeMailer = require("../classes/nodemailer");
const bcrypt = require("bcryptjs");
const fs = require("fs");

//!GET REQUESTS
//* fetching data and send it as json routes

//? retrieving user data as JSON
exports.getUsers = (req, res, next) => {
  userModel
    .find()
    .lean()
    .exec()
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "An error occurred" });
    });
};

//? retrieving profit data as JSON
exports.getProfit = (req, res, next) => {
  orderModel
    .aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalProfit: {
            $sum: {
              $subtract: [
                {
                  $multiply: [
                    "$products.quantity",
                    "$products.product.priceSold",
                  ],
                },
                {
                  $multiply: [
                    "$products.quantity",
                    "$products.product.priceBought",
                  ],
                },
              ],
            },
          },
        },
      },
    ])
    .exec()
    .then((profits) => {
      res.json(profits);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "An error occurred" });
    });
};

//? retrieving orders data as JSON
exports.getOrders = (req, res, next) => {
  orderModel
    .find()
    .lean()
    .exec()
    .then((orders) => {
      res.json(orders);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "An error occurred" });
    });
};

//? retrieving best selling product data as JSON
exports.getBestSales = (req, res, next) => {
  productModel
    .find()
    .sort({ sold: -1 })
    .limit(5)
    .lean()
    .exec()
    .then((products) => {
      res.json(products);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "An error occurred" });
    });
};

//* dashboard routes

//?dashboard main page
exports.getDashboard = (req, res, next) => {
  const adminId = req.session.admin;
  console.log(adminId);
  adminModel
    .findById(adminId)
    .then((admin) => {
      const adminName = admin.name;
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const totalCountPromise = userModel.countDocuments({});
      const lastMonthCountPromise = userModel.countDocuments({
        createdAt: { $gte: oneMonthAgo },
      });
      const totalQuantityPromise = productModel.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantity" },
          },
        },
      ]);
      const totalOrdersPromise = orderModel.countDocuments({});
      const lastMonthOrdersPromise = orderModel.countDocuments({
        createdAt: { $gte: oneMonthAgo },
      });
      const totalPricePromise = orderModel.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: null,
            totalPrice: {
              $sum: {
                $subtract: [
                  {
                    $multiply: [
                      "$products.quantity",
                      "$products.product.priceSold",
                    ],
                  },
                  {
                    $multiply: [
                      "$products.quantity",
                      "$products.product.priceBought",
                    ],
                  },
                ],
              },
            },
          },
        },
      ]);
      const totalBudgetPromise = productModel.aggregate([
        {
          $group: {
            _id: null,
            totalBudget: {
              $sum: {
                $multiply: ["$quantity", "$priceBought"],
              },
            },
          },
        },
      ]);
      const lowStockPromise = productModel.find({ quantity: { $lt: 5 } });
      Promise.all([
        totalCountPromise,
        lastMonthCountPromise,
        totalQuantityPromise,
        totalOrdersPromise,
        lastMonthOrdersPromise,
        totalPricePromise,
        totalBudgetPromise,
        lowStockPromise,
      ]).then(
        ([
          allUsersCount,
          usersLastMonthCount,
          totalQuantityResult,
          totalOrdersCount,
          lastMonthOrdersCount,
          totalPriceResult,
          totalBudgetCount,
          lowStockProducts,
        ]) => {
          const totalQuantity =
            totalQuantityResult.length > 0
              ? totalQuantityResult[0].totalQuantity
              : 0;
          const totalPrice =
            totalPriceResult.length > 0 ? totalPriceResult[0].totalPrice : 0;
          const totalBudget =
            totalBudgetCount.length > 0 ? totalBudgetCount[0].totalBudget : 0;
          res.render("./admin/dashboard-main", {
            pageTitle: "dashboard",
            path: "/dash",
            allUsersCount,
            usersLastMonthCount,
            totalQuantity,
            totalOrdersCount,
            lastMonthOrders: lastMonthOrdersCount,
            totalPrice,
            totalBudget,
            lowStockProducts,
            adminName: adminName,
          });
        }
      );
    })
    .catch((error) => {
      console.log(error);
    });
};

//? GET adminDashboard
exports.getAdminDashboard = (req, res, next) => {
  const adminId = req.session.admin;
  console.log(adminId);
  adminModel
    .findById(adminId)
    .then((admin) => {
      const adminName = admin.name;

      adminModel
        .find()
        .then((admins) => {
          res.render("./admin/dashboard-admins", {
            pageTitle: "dashboard-admins",
            path: "/dash/admin",
            adminName: adminName,
            admins: admins,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
};

//? GET customersDashboard
exports.getCustomersDashboard = (req, res, next) => {
  const adminId = req.session.admin;
  console.log(adminId);
  adminModel
    .findById(adminId)
    .then((admin) => {
      const adminName = admin.name;
      userModel
        .aggregate([
          {
            $lookup: {
              from: "orders",
              localField: "_id",
              foreignField: "user.userId",
              as: "orders",
            },
          },
          {
            $addFields: {
              orderCount: { $size: "$orders" },
            },
          },
        ])
        .then((users) => {
          res.render("./admin/dash-customers", {
            pageTitle: "dashboard-customers",
            path: "/dash/customers",
            users: users,
            adminName: adminName,
          });
        });
    })
    .catch((err) => console.error(err));
};

//? GET subscribers Dashboard
exports.getSubscribersDashboard = (req, res, next) => {
  const adminId = req.session.admin;
  console.log(adminId);
  adminModel
    .findById(adminId)
    .then((admin) => {
      const adminName = admin.name;
      subscribersModel
        .find()
        .then((subscribers) => {
          res.render("./admin/dash-subscribers", {
            pageTitle: "dashboard-subscribers",
            path: "/dash/subscribers",
            adminName: adminName,
            subscribers: subscribers,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
};

//? GET products page Dashboard
exports.getProductsDashboard = (req, res, next) => {
  const adminId = req.session.admin;
  console.log(adminId);
  adminModel
    .findById(adminId)
    .then((admin) => {
      const adminName = admin.name;
      productModel
        .find()
        .populate("category")
        .then((products) => {
          res.render("./admin/dashboard-products", {
            pageTitle: "dashboard-products",
            path: "/dash/products",
            products: products,
            adminName: adminName,
          });
        });
    })
    .catch((err) => console.error(err));
};

//? GET add products
exports.getAddProduct = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  Promise.all([categoryModel.find(), sellersModel.find()])
    .then(([categories, sellers]) => {
      res.render("./admin/add-product", {
        pageTitle: "dashboard-addProducts",
        path: "/dash/add-products",
        categories,
        sellers,
        product: [],
        errorMessage: message,
      });
    })
    .catch((err) => console.error(err));
};

//? GET edit products routes
exports.getEditProduct = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const productId = req.params.id;
  console.log(productId);
  Promise.all([
    categoryModel.find(),
    sellersModel.find(),
    productModel.findOne({ _id: productId }),
  ])
    .then(([categories, sellers, product]) => {
      res.render("./admin/add-product", {
        pageTitle: "dashboard-addProducts",
        path: "/dash/add-products",
        categories,
        sellers,
        product,
        errorMessage: message,
      });
    })
    .catch((err) => console.error(err));
};

//? GET add seller
exports.getAddSeller = (req, res, next) => {
  res.render("./admin/add-seller", {
    pageTitle: "dashboard-addSeller",
    path: "/dash/add-seller",
    seller: false,
  });
};

//? GET edit seller
exports.getEditSeller = (req, res, next) => {
  const sellerId = req.params.id;
  console.log(sellerId);
  sellersModel
    .findById(sellerId)
    .then((seller) => {
      res.render("./admin/add-seller", {
        pageTitle: "dashboard-editSeller",
        path: "/dash/edit-seller",
        seller: seller,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

//? GET ordersDashboard
const calculateTotalPrice = (order) => {
  let totalPrice = 0;
  order.products.forEach((product) => {
    totalPrice += product.quantity * product.product.priceSold;
  });
  return totalPrice.toFixed(2);
};

exports.getOrdersDashboard = (req, res, next) => {
  const adminId = req.session.admin;
  console.log(adminId);
  adminModel
    .findById(adminId)
    .then((admin) => {
      const adminName = admin.name;
      orderModel
        .find()
        .sort({ createdAt: -1 })
        .populate("user", "name email")
        .then((orders) => {
          res.render("./admin/dashboard-orders", {
            pageTitle: "dashboard-orders",
            path: "/dash/orders",
            orders: orders,
            adminName: adminName,
            calculateTotalPrice: calculateTotalPrice,
          });
        });
    })
    .catch((err) => {
      console.error(err);
    });
};

//? GET sellersDashboard
exports.getSellersDashboard = (req, res, next) => {
  const adminId = req.session.admin;
  console.log(adminId);
  adminModel
    .findById(adminId)
    .then((admin) => {
      const adminName = admin.name;
      sellersModel.find({}).then((sellers) => {
        res.render("./admin/dashboard-sellers", {
          pageTitle: "dashboard-sellers",
          path: "/dash/seller",
          sellers: sellers,
          adminName: adminName,
        });
      });
    })
    .catch((err) => console.error(err));
};

//? GET sign up
exports.getSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("sign-up", {
    pageTitle: "dashboard-sellers",
    path: "/dash/signUp",
    errorMessage: message,
    admin: true,
  });
};

//? GET sign in
exports.getSignIn = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("sign-in", {
    pageTitle: "dashboard-sellers",
    path: "/dash/signIn",
    errorMessage: message,
    admin: true,
  });
};
//* must be fixed

//? GET admin profile
exports.getProfile = (req, res, next) => {
  let message = req.flash("success");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  //? getting admin information
  accountId = req.session.admin;
  console.log(accountId);
  adminModel
    .findById(accountId)
    .then((adminData) => {
      console.log(adminData);
      res.render("profile", {
        pageTitle: "profile",
        path: "/admin/profile",
        successMessage: message,
        adminData: adminData,
        admin: true,
      });
    })
    .catch((err) => console.log(err));
};

//!POST REQUESTS

//? POST admin sign up function
exports.postSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  console.log(name, email, password, confirmPassword);
  // Password pattern: at least one capital letter, at least one number, minimum length of 8 characters
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordPattern.test(password)) {
    req.flash(
      "error",
      "Password must contain at least one capital letter, one number, and be at least 8 characters long"
    );
    return res.redirect("/sign-up");
  }
  adminModel
    .findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "invalid email");
        return res.redirect("/dash/signUp");
      } else if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match");
        return res.redirect("/dash/signUp");
      } else {
        return bcrypt
          .hash(password, 10)
          .then((hashedPassword) => {
            const admin = new adminModel({
              name: name,
              email: email,
              password: hashedPassword,
              cart: { items: [] },
            });
            let nodeMailer = new NodeMailer();
            let to = email;
            let subject = "sign up";
            let htmlContent = `
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link rel="icon" type="image/x-icon" href="/pictures/grovemade logo.png">
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
                        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
                        <title>email</title>
                    </head>
                    <body style="font-family: 'Roboto', sans-serif; font-weight: 300; letter-spacing: 2px; text-align: center;">
                      <h1>welcome to grovemade mr: ${name}</h1>
                      <h2>we are happy that you sign up with us as an admin</h2>
                    </body>
                `;
            nodeMailer.sendMail(to, subject, htmlContent);
            console.log(admin);
            res.redirect("/dash/signIn");
            return admin.save();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

//? POST admin sign in function
exports.postSignIn = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  adminModel
    .findOne({ email: email })
    .then((admin) => {
      if (!admin) {
        req.flash("error", "this email do not exists");
        return res.redirect("back");
      }
      bcrypt
        .compare(password, admin.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.isAdmin = true;
            req.session.admin = admin._id;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          req.flash("error", "invalid password");
          res.redirect("back");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

//? POST user update account info
exports.postUpdateAdminInfo = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  console.log(name, email);
  accountId = req.session.admin;
  console.log(accountId);
  adminModel
    .findByIdAndUpdate(accountId, {
      $set: {
        name: name,
        email: email,
      },
    })
    .then(() => {
      console.log(`account id:${req.session.admin} updated`);
      req.flash("success", "Account updated successfully");
      res.redirect("back");
    })
    .catch((err) => {
      console.log(err);
    });
};

//? POST admin delete he's account
exports.postDeleteAccount = (req, res, next) => {
  accountId = req.session.admin;
  adminModel
    .findByIdAndDelete({ _id: accountId })
    .then(() => {
      console.log(`account id:${req.session.admin} deleted`);
      req.session.destroy((err) => {
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//? POST admin delete users accounts from dashboard
exports.postDeleteUserAccounts = (req, res, next) => {
  const userId = req.params.id;
  console.log(`user id:${userId} deleted`);
  userModel
    .findByIdAndDelete(userId)
    .then(() => {
      res.redirect("/dash/customers");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/dash/customers");
    });
};

//? POST admin delete sellers from dashboard
exports.postDeleteSellers = (req, res, next) => {
  const sellerId = req.params.id;
  console.log(`seller id:${sellerId} deleted`);
  sellersModel
    .findByIdAndDelete(sellerId)
    .then(() => {
      res.redirect("/dash/sellers");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/dash/sellers");
    });
};

//? POST add sellers information from dashboard
exports.postAddSellerInfo = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const product1 = {
    name: req.body.product_1,
  };
  const product2 = {
    name: req.body.product_2,
  };
  const product3 = {
    name: req.body.product_3,
  };
  const products = [product1, product2, product3];
  console.log(name, email, phone, product1, product2, product3);

  const seller = new sellersModel({
    name: name,
    email: email,
    phone: phone,
    products: products,
  });
  seller
    .save()
    .then((result) => {
      res.redirect("/dash/sellers");
      console.log("seller added successfully");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("back");
    });
};

//? POST edit sellers information from dashboard
exports.postEditSeller = (req, res, next) => {
  const sellerId = req.params.sellerId;
  console.log(sellerId);
  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const product1 = {
    name: req.body.product_1,
  };
  const product2 = {
    name: req.body.product_2,
  };
  const product3 = {
    name: req.body.product_3,
  };
  const products = [product1, product2, product3];
  console.log(name, email, phone, product1, product2, product3);
  sellersModel
    .findByIdAndUpdate(sellerId, { name, email, phone, products })
    .then(() => {
      res.redirect("/dash/sellers");
      console.log("sellers updated successfully");
    })
    .catch((error) => {
      console.log(error);
    });
};

//? POST admin delete products from dashboard
// POST admin delete products from dashboard
exports.postDeleteProduct = (req, res, next) => {
  const productId = req.params.id;
  console.log(`product id:${productId} deleted`);
  productModel
    .findByIdAndDelete(productId)
    .then((product) => {
      // Delete the product images from the server's file system
      if (product.mainImagesPath && product.mainImagesPath.length) {
        product.mainImagesPath.forEach((imagePath) => {
          fs.unlinkSync(imagePath);
        });
      }
      if (product.secondaryImagesPath && product.secondaryImagesPath.length) {
        product.secondaryImagesPath.forEach((imagePath) => {
          fs.unlinkSync(imagePath);
        });
      }
      res.redirect("back");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("back");
    });
};

//? POST admin add products from dashboard
exports.postAddProduct = (req, res, next) => {
  const product = new productModel({
    name: req.body.name,
    material: req.body.material,
    mainImagesPath: req.files.primaryImages
      ? req.files.primaryImages.map((file) => file.path)
      : [],
    secondaryImagesPath: req.files.secondaryImages
      ? req.files.secondaryImages.map((file) => file.path)
      : [],

    description: req.body.description,
    category: req.body.category,
    priceBought: req.body.priceBought,
    priceSold: req.body.priceSold,
    quantity: req.body.quantity,
    sold: 0,
    color: req.body.color,
    sellerId: req.body.seller,
  });
  console.log(req.body, req.file);
  console.log("adding");
  // Check if pictures are added
  if (
    product.mainImagesPath.length === 0 &&
    product.secondaryImagesPath.length === 0
  ) {
    req.flash("error", "Please add pictures for the product.");
    return res.redirect("/dash/add-product");
  }
  product
    .save()
    .then((result) => {
      console.log(result);
      res.redirect("/dash/products");
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

//? POST admin edit products from dashboard
exports.postEditProduct = (req, res, next) => {
  const productId = req.params.id;
  const updatedProduct = {
    name: req.body.name,
    material: req.body.material,
    description: req.body.description,
    category: req.body.category,
    priceBought: req.body.priceBought,
    priceSold: req.body.priceSold,
    quantity: req.body.quantity,
    color: req.body.color,
    sellerId: req.body.seller,
  };
  if (req.files.primaryImages && req.files.primaryImages.length > 0) {
    updatedProduct.mainImagesPath = req.files.primaryImages.map(
      (file) => file.path
    );
  }
  if (req.files.secondaryImages && req.files.secondaryImages.length > 0) {
    updatedProduct.secondaryImagesPath = req.files.secondaryImages.map(
      (file) => file.path
    );
  }
  console.log(productId);
  productModel
    .findOneAndUpdate({ _id: productId }, updatedProduct, {
      new: true,
      runValidators: true,
    })
    .then((product) => {
      console.log(`Updated product: ${product}`);
      res.redirect("/dash/products");
    })
    .catch((err) => console.error(err));
};

//? POST admin add category from dashboard add product
exports.postAddCategory = (req, res, next) => {
  const newCategory = req.body.category;
  console.log(newCategory);
  const category = new categoryModel({
    name: newCategory,
  });
  category
    .save()
    .then((result) => {
      console.log(result);
      res.redirect("/dash/products");
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

//? POST admin delete order from dashboard orders
exports.postDeleteOrder = (req, res, next) => {
  const orderId = req.params.id;
  console.log(orderId);
  orderModel
    .findByIdAndDelete(orderId)
    .then(() => {
      res.redirect("back");
      console.log(`order id:${orderId} deleted`);
    })
    .catch((err) => {
      console.log(err);
    });
};

//? POST admin delete order from dashboard orders
exports.postDeleteAdmin = (req, res, next) => {
  const adminId = req.params.id;
  console.log(adminId);
  adminModel
    .findByIdAndDelete(adminId)
    .then(() => {
      res.redirect("back");
      console.log(`order id:${adminId} deleted`);
    })
    .catch((err) => {
      console.log(err);
    });
};

//? POST admin delete subscriber from dashboard subscribers
exports.postDeleteSubscriber = (req, res, next) => {
  const subscriberId = req.params.id;
  console.log(subscriberId);
  subscribersModel
    .findByIdAndDelete(subscriberId)
    .then(() => {
      res.redirect("back");
      console.log(`order id:${subscriberId} deleted`);
    })
    .catch((err) => {
      console.log(err);
    });
};
