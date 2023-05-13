const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const csrf = require("csurf");
const multer = require("multer");
const mongodbUrl = "mongodb://127.0.0.1/grovemade";

const app = express();

// getting routes from routes file
const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

// setting views engine and views directory
app.set("view engine", "ejs");
app.set("views", "views");

//starting csrf protection
const csrfProtection = csrf();

// storing sessions into my database
const store = new mongodbStore({
  uri: mongodbUrl,
  collection: "sessions",
});
store.on("error", function (error) {
  console.log(error);
});

//setting sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//using public directory
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

//using flash
app.use(flash());

//using multer -------------------------------
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    { name: "primaryImages", maxCount: 3 },
    { name: "secondaryImages", maxCount: 3 },
  ])
);

//--------------------------------------------

//using csrf
app.use(csrfProtection);

// setting middleware to add is logged in and csrf token to all rendered views
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// using routes
app.use(shopRoutes);
app.use(adminRoutes);
app.use(authRoutes);

// connecting to mongodb database
mongoose
  .connect(mongodbUrl)
  .then((result) => {
    console.log("connected to database successfully");
  })
  .catch((err) => {
    console.log(err);
  });

//choosing port and starting server
const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
