const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// setting views engine and views directory
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views')

// getting routes from routes file
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

//using public directory
app.use(bodyParser.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname, 'public')));

// using routes
app.use(shopRoutes);
app.use(adminRoutes);
app.use(authRoutes);

// connecting to mongodb database
mongoose.connect(`mongodb://127.0.0.1/grovemade`)
.then(result => {
    console.log('connected to database successfully');
})
.catch(err => {
    console.log(err)}
);

//choosing port and starting server
const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
