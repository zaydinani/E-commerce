const userModel = require("../models/user");
const productModel = require("../models/products");
const orderModel = require("../models/order");
const subscribersModel = require("../models/subscribers");
const adminModel = require("../models/admin");
const NodeMailer = require("../classes/nodemailer");
const bcrypt = require("bcryptjs");

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
  ])
    .then(
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
        const totalQuantity = totalQuantityResult[0].totalQuantity;
        const totalPrice = totalPriceResult[0].totalPrice;
        const totalBudget = totalBudgetCount[0].totalBudget;
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
        });
      }
    )
    .catch((error) => {
      console.log(error);
    });
};

exports.getAdminDashboard = (req, res, next) => {
  res.render("./admin/dashboard-admins", {
    pageTitle: "dashboard-admins",
    path: "/dash/admin",
  });
};

exports.getCustomersDashboard = (req, res, next) => {
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
      });
    })
    .catch((err) => console.error(err));
};
exports.getProductsDashboard = (req, res, next) => {
  res.render("./admin/dashboard-products", {
    pageTitle: "dashboard-products",
    path: "/dash/products",
  });
};

exports.getOrdersDashboard = (req, res, next) => {
  res.render("./admin/dashboard-orders", {
    pageTitle: "dashboard-orders",
    path: "/dash/orders",
  });
};
exports.getSellersDashboard = (req, res, next) => {
  res.render("./admin/dashboard-sellers", {
    pageTitle: "dashboard-sellers",
    path: "/dash/seller",
  });
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
                    <body style="background-color: black;">
                        <h1 style="color: green;">welcome to grovemade mr: ${name}</h1> 
                        <p style="color: red;">we happy that you sign up with us</p>
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

//? POST user delete account
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
