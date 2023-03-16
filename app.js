const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session);
const mongodbUrl = 'mongodb://127.0.0.1/grovemade';
/* const flash = require('connect-flash'); */

const app = express();
// storing sessions into my database
const store = new mongodbStore({
    uri: mongodbUrl,
    collection: 'sessions'
});
store.on('error', function (error) {
    console.log(error);
})

// setting views engine and views directory
app.set('view engine', 'ejs');
app.set('views', 'views')

//setting sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: store
}))

/* using flash
app.use(flash());
*/

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
mongoose.connect(mongodbUrl)
.then(result => {
    console.log('connected to database successfully');
})
.catch(err => {
    console.log(err)}
);

//choosing port and starting server
const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
