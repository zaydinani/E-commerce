const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');












const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views')

const shopRoutes = require('./routes/shop');
/*
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
*/

app.use(bodyParser.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname, 'public')));







app.use(shopRoutes);
/*
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
*/





const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));