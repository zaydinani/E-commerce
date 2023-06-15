const productModel = require("../models/products");
const subscribersModel = require("../models/subscribers");
const userModel = require("../models/user");
const orderModel = require("../models/order");
const categoryModel = require("../models/categories");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const NodeMailer = require("../classes/nodemailer");

//! GET ROUTES
//? GET user shop pages routes
exports.getHome = (req, res, next) => {
  productModel
    .aggregate([{ $sample: { size: 7 } }])
    .then((products) => {
      //console.log(products)
      res.render("home", {
        pageTitle: "Home",
        path: "/",
        prods: products,
      });
    })
    .catch((err) => console.error(err));
};

//? GET fetch all products
exports.getProducts = (req, res, next) => {
  productModel
    .find({})
    .then((products) => {
      res.render("products-page", {
        pageTitle: "products",
        path: "/products",
        prods: products,
      });
    })
    .catch((err) => console.error(err));
};
//? GET fetch laptop stands products page
exports.getLaptopStands = (req, res, next) => {
  const excludedCategories = ["deskPad"];
  categoryModel
    .find({ name: { $nin: excludedCategories } })
    .then((categories) => {
      const categoryIds = categories.map((category) => category._id);
      return productModel
        .find({ category: { $in: categoryIds } })
        .populate("category");
    })
    .then((products) => {
      res.render("products-page", {
        pageTitle: "Laptop Stands",
        path: "/products",
        prods: products,
      });
    })
    .catch((err) => console.error(err));
};
//? GET fetch desk pads products page
exports.getDeskPads = (req, res, next) => {
  categoryModel
    .findOne({ name: "deskPad" })
    .then((category) => {
      return productModel.find({ category: category._id }).populate("category");
    })
    .then((products) => {
      res.render("products-page", {
        pageTitle: "LaptopStands",
        path: "/products",
        prods: products,
      });
    })
    .catch((err) => console.error(err));
};
//? GET fetch the product user click on on product page
exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  console.log("productId:" + productId);
  productModel
    .findById(productId)
    .then((product) => {
      console.log(product.mainImagesPath);
      const category = product.category;
      console.log(product.quantity);
      productModel
        .find({ category: category, _id: { $ne: productId } })
        .limit(3)
        .then((similarProduct) => {
          const isLoggedIn = req.session.isLoggedIn || false;
          let wishlistProducts = [];
          if (isLoggedIn) {
            userModel
              .findById(req.session.user)
              .then((user) => {
                console.log("user:", user);
                if (user && user.wishlist) {
                  wishlistProducts = user.wishlist;
                }
                const productIdsInWishlist = wishlistProducts.map((item) =>
                  item.productId.toString()
                );
                console.log("wishlistProducts:", wishlistProducts);
                console.log("productIdsInWishlist:", productIdsInWishlist);
                res.render("product-page", {
                  pageTitle: "product",
                  path: "/product",
                  prod: product,
                  similarProds: similarProduct,
                  isLoggedIn: isLoggedIn,
                  wishlistProducts: wishlistProducts,
                  productIdsInWishlist: productIdsInWishlist,
                });
              })
              .catch((err) => console.error(err));
          } else {
            res.render("product-page", {
              pageTitle: "product",
              path: "/product",
              prod: product,
              similarProds: similarProduct,
              isLoggedIn: isLoggedIn,
              wishlistProducts: wishlistProducts,
              productIdsInWishlist: [],
            });
          }
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

//? GET fetch products in cart page
exports.getCart = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  req.user
    .populate({
      path: "cart.items.productId",
      model: "products",
    })
    .then((user) => {
      const Products = user.cart.items;
      let totalPrice = 0;
      for (let i = 0; i < Products.length; i++) {
        const product = Products[i].productId;
        const quantity = Products[i].quantity;
        const price = product.priceSold;
        totalPrice += quantity * price;
      }
      accountId = req.session.user;
      userModel
        .findById(accountId)
        .then((userData) => {
          res.render("cart", {
            pageTitle: "cart",
            path: "/cart",
            products: Products,
            totalPrice: totalPrice,
            errorMessage: message,
            userData: userData,
          });
        })
        .catch((err) => console.log(err));
      console.log(accountId);
      console.log(totalPrice);
      console.log(Products);
    })
    .catch((err) => console.error(err));
};
//? GET contact us
exports.getContactUs = (req, res, next) => {
  let message = req.flash("success");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("contact-us", {
    pageTitle: "contact-us",
    path: "/contact-us",
    successMessage: message,
  });
};
//? GET thank you page
exports.getThankYou = (req, res, next) => {
  res.render("thank-you", {
    pageTitle: "thank-you",
    path: "/thank-you",
  });
};
//? GET faq
exports.getFaq = (req, res, next) => {
  res.render("faq", {
    pageTitle: "faq",
    path: "/faq",
  });
};
//? GET wishlist
exports.getWishlist = (req, res, next) => {
  const userId = req.session.user;
  userModel
    .findById(userId)
    .populate("wishlist.productId") // Populate the productId field with the actual product document
    .exec()
    .then((user) => {
      if (!user) {
        console.log("User not found");
      }
      const wishlistProducts = user.wishlist;
      res.render("wishlist", {
        pageTitle: "Wishlist",
        path: "/wishlist",
        wishlistProducts: wishlistProducts,
      });
    })
    .catch((err) => {
      console.error(err);
    });
};
//? GET user orders pages routes
const calculateTotalPrice = (order) => {
  let totalPrice = 0;
  order.products.forEach((product) => {
    totalPrice += product.quantity * product.product.priceSold;
  });
  return totalPrice.toFixed(2);
};
exports.getUsersOrder = (req, res, next) => {
  const userId = req.session.user;
  console.log(userId);
  orderModel
    .find({ userId: userId.userId })
    .sort({ createdAt: -1 })
    .then((orders) => {
      res.render("user-orders", {
        pageTitle: "orders",
        path: "/user-orders",
        orders: orders,
        calculateTotalPrice: calculateTotalPrice,
      });
      console.log(orders);
    })
    .catch((err) => {
      console.error(err);
    });
};
//! POST ROUTES
//? POST subscribe to newsletter
exports.postSubscribe = (req, res, next) => {
  const email = req.body.email;
  console.log(email);
  subscribersModel
    .findOne({ email: email })
    .then((subscriberDoc) => {
      if (subscriberDoc) {
        console.log("email already subscribed");
        return res.redirect("back");
      } else {
        const subscriber = new subscribersModel({
          email: email,
        });
        let nodeMailer = new NodeMailer();
        let to = email;
        let subject = "subscribe to newsletter";
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
                  <h1>welcome to grovemade newsletter</h1>
                  <h2>we happy that you sign up with us</h2>
              </body>
            `;
        nodeMailer.sendMail(to, subject, htmlContent);
        console.log("email subscribed successfully");
        res.redirect("back");
        return subscriber.save();
      }
    })
    .catch((err) => console.log(err));
};
//? POST add products to cart
exports.postAddToCart = (req, res, next) => {
  const productId = req.body.productId;
  console.log(productId);
  productModel
    .findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};
//? POST delete products from cart
exports.postDeleteFromCart = (req, res, next) => {
  const productId = req.body.productId;
  console.log(productId);
  req.user
    .removeFromCart(productId)
    .then((result) => {
      res.redirect("back");
      console.log("Product:" + productId + " deleted successfully from cart");
    })
    .catch((err) => {
      console.log(err);
    });
};
//? POST checkout
exports.postCheckout = (req, res, next) => {
  if (req.user.cart.items.length === 0) {
    console.log("empty cart");
    req.flash("error", "your cart is empty add a product to checkout");
    return res.redirect("back");
  }
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      const Products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc },
        };
      });
      const productUpdates = Products.map((item) => {
        return productModel.findByIdAndUpdate(item.product._id, {
          $inc: { quantity: -item.quantity, sold: item.quantity },
        });
      });
      return Promise.all(productUpdates).then(() => {
        const order = new orderModel({
          user: {
            email: req.user.email,
            userId: req.user,
          },
          products: Products,
        });
        //pdf start
        // Create a new PDF document
        const pdfDoc = new PDFDocument();
        // Add content to the PDF document
        pdfDoc.fontSize(24).text("Receipt", {
          underline: true,
          align: "center",
        });
        pdfDoc.moveDown(0.5);
        pdfDoc.fontSize(16).text("Order ID: " + order._id);
        pdfDoc.moveDown(0.5);
        pdfDoc.fontSize(16).text("User Email: " + req.user.email);
        pdfDoc.moveDown(0.5);
        // Write the content of the PDF document
        pdfDoc
          .fontSize(16)
          .text("Thank you for your purchase MR: " + req.user.name);
        pdfDoc.moveDown(0.5);
        pdfDoc.text("hope to see you again");
        pdfDoc.moveDown(1);
        // Add the list of product names
        pdfDoc.fontSize(16).text("Products:", { underline: true });
        pdfDoc.moveDown(0.5);
        order.products.forEach((item) => {
          pdfDoc
            .fontSize(14)
            .text(
              "- " + item.product.name + " (Quantity x " + item.quantity + ")"
            );
          pdfDoc.moveDown(1);
        });
        pdfDoc
          .fontSize(16)
          .text("Total Amount: $" + calculateTotalPrice(order));
        pdfDoc.moveDown(0.5);
        // Generate a unique filename for the PDF
        const filename = `receipt-${Date.now()}.pdf`;
        const pdfFilePath = path.join(__dirname, "..", "data", filename);
        const pdfFileUrl = `http://localhost:3000/receipts/${filename}`;
        // Pipe the PDF document to a file stream
        pdfDoc.pipe(fs.createWriteStream(pdfFilePath));
        // Finalize the PDF document
        pdfDoc.end();
        let nodeMailer = new NodeMailer();
        let to = req.user.email;
        let subject = "purchase";
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
                  <h1>thank you for buying from grovemade</h1>
                  <h2>your purchase id is: ${order._id}</h2>
                  <p>Please find the receipt attached.</p>
                  <a href="${pdfFileUrl}">Download Receipt</a>
              </body>
            `;
        nodeMailer.sendMail(to, subject, htmlContent, [
          {
            filename: "receipt.pdf",
            path: pdfFilePath,
          },
        ]);
        console.log("email for purchase successfully sent");
        return order.save();
      });
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/thank-you");
    })
    .catch((err) => console.log(err));
};

//? POST contact us form
exports.getContactForm = (req, res, next) => {
  const name = req.body.name;
  const bodySubject = req.body.subject;
  const message = req.body.message;
  const receivedEmail = "zaydinani@protonmail.com";
  console.log(name, bodySubject, message);
  let nodeMailer = new NodeMailer();
  let to = receivedEmail;
  let subject = bodySubject;
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
          <h1>this is an email sent from grovemade contact us page</h1>
            <h2>${message}</h2>
        </body>
    `;
  nodeMailer.sendMail(to, subject, htmlContent);
  console.log("email from contact us successfully sent");
  req.flash("success", "your email have been sent successfully");
  return res.redirect("back");
};

//? POST add products to wishlist
exports.postAddToWishlist = (req, res, next) => {
  const productId = req.params.id;

  productModel
    .findById(productId)
    .then((product) => {
      return req.user.addToWishlist(productId);
    })
    .then(() => {
      res.redirect("/wishlist");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("back");
    });
};
//? POST remove product from wishlist
exports.postRemoveFromWishlist = (req, res, next) => {
  const productId = req.params.id;
  req.user
    .removeFromWishlist(productId)
    .then(() => {
      res.redirect("/wishlist");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/wishlist");
    });
};
