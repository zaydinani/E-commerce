const userModel = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const NodeMailer = require("../classes/nodemailer");
//user authentication and registration routes
//! GET ROUTES
//? GET sign up
exports.getSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("sign-up", {
    pageTitle: "Sign Up",
    path: "/sign-up",
    errorMessage: message,
    admin: false,
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
    pageTitle: "Sign In",
    path: "/sign-in",
    errorMessage: message,
    admin: false,
  });
};
//? GET user profile
exports.getProfile = (req, res, next) => {
  let message = req.flash("success");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  //? getting user information
  accountId = req.session.user;
  userModel
    .findById(accountId)
    .then((userData) => {
      res.render("profile", {
        pageTitle: "profile",
        path: "/profile",
        successMessage: message,
        userData: userData,
        admin: false,
      });
    })
    .catch((err) => console.log(err));
};
//? GET reset password
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  userModel
    .findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let errorMessage = req.flash("error");
      if (errorMessage.length > 0) {
        errorMessage = errorMessage[0];
      } else {
        errorMessage = null;
      }
      res.render("password-reset", {
        pageTitle: "password reset",
        path: "/password-reset",
        errorMessage: errorMessage,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};
//? GET write email to send password reset
exports.getEmailResetPassword = (req, res, next) => {
  let errorMessage = req.flash("error");
  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }
  res.render("email-resit", {
    pageTitle: "email password reset",
    path: "/email-resit",
    errorMessage: errorMessage,
  });
};
//! POST ROUTES
//? POST user sign up function
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
  userModel
    .findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "invalid email");
        return res.redirect("/sign-up");
      } else if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match");
        return res.redirect("/sign-up");
      } else {
        return bcrypt
          .hash(password, 10)
          .then((hashedPassword) => {
            const user = new userModel({
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
                        <h2>we are happy that you sign up with us</h2>
                    </body>
                `;
            nodeMailer.sendMail(to, subject, htmlContent);
            console.log(user);
            res.redirect("/sign-in");
            return user.save();
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
//? POST user sign in function
exports.postSignIn = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  userModel
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "this email do not exists");
        return res.redirect("/sign-in");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.isAdmin = false;
            req.session.user = user._id;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          req.flash("error", "invalid password");
          res.redirect("/sign-in");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
//? POST user sign out
exports.postSignOut = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("user signed out");
    res.redirect("/");
  });
};
//? POST user delete account
exports.postDeleteAccount = (req, res, next) => {
  accountId = req.session.user;
  userModel
    .findByIdAndDelete({ _id: accountId })
    .then(() => {
      console.log(`account id:${req.session.user} deleted`);
      req.session.destroy((err) => {
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//? POST user update account info
exports.postUpdateUserInfo = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const city = req.body.city;
  const street = req.body.street;
  const building = req.body.building;
  const apartment = req.body.apartment;
  console.log(name, email, city, street, building, apartment);
  accountId = req.session.user;
  console.log(accountId);
  userModel
    .findByIdAndUpdate(accountId, {
      $set: {
        name: name,
        email: email,
        address: {
          city: city,
          street: street,
          building: building,
          apartmentNumber: apartment,
        },
      },
    })
    .then(() => {
      console.log(`account id:${req.session.user} updated`);
      req.flash("success", "Account updated successfully");
      res.redirect("back");
    })
    .catch((err) => {
      console.log(err);
    });
};
//? POST send email to reset password
exports.postEmailResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/email-resit");
    }
    const token = buffer.toString("hex");
    userModel
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "no email found");
          return res.redirect("back");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        let nodeMailer = new NodeMailer();
        let to = req.body.email;
        let subject = "password reset";
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
                  <h1>you requested a password reset</h1>
                    <h2>click this link to change your password <a href="http://localhost:3000/password-reset/${token}">link</a></h2>
                </body>
            `;
        nodeMailer.sendMail(to, subject, htmlContent);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

//? POST reset new password
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  console.log(userId);
  console.log(newPassword);
  console.log(passwordToken);
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordPattern.test(newPassword)) {
    req.flash(
      "error",
      "Password must contain at least one capital letter, one number, and be at least 8 characters long"
    );
    console.log("Password did not change");
    return res.redirect("back");
  }
  userModel
    .findOne({
      resetToken: passwordToken,
      resetTokenExpiration: {
        $gt: Date.now(),
      },
      _id: userId,
    })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      console.log("Password changed successfully");

      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/sign-in");
    })
    .catch((err) => console.log(err));
};
