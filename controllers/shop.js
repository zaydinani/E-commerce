const productModel = require('../models/products')
const subscribersModel = require('../models/subscribers')
const NodeMailer = require('../classes/nodemailer');

//! GET ROUTES
//? user shop pages routes
exports.getHome = (req, res, next) => {
    productModel.aggregate([{ $sample: {size:7}}])
    .then(products => {
        //console.log(products)
        res.render('home', {
            pageTitle: 'Home',
            path: '/',
            prods: products
        })
    }).catch(err => console.error(err));
}
exports.getProducts = (req, res, next) => {
    res.render('products-page', {
        pageTitle: 'products',
        path: '/products',
    })
}
exports.getProduct = (req, res, next) => {
    res.render('product-page', {
        pageTitle: 'product',
        path: '/product',
    })
}
exports.getCart = (req, res, next) => {
    res.render('cart', {
        pageTitle: 'cart',
        path: '/cart',
    })
}
exports.getContactUs = (req, res, next) => {
    res.render('contact-us', {
        pageTitle: 'contact-us',
        path: '/contact-us',
    })
}
exports.getFaq = (req, res, next) => {
    res.render('faq', {
        pageTitle: 'faq',
        path: '/faq',
    })
}
exports.getWishlist = (req, res, next) => {
    res.render('wishlist', {
        pageTitle: 'wishlist',
        path: '/wishlist',
    })
}



//! POST ROUTES
//? subscribe to newsletter
exports.postSubscribe = (req, res, next) => {
    const email = req.body.email
    console.log(email)
    subscribersModel.findOne({ email: email})
    .then(subscriberDoc => {
        if (subscriberDoc) {
            console.log('email already subscribed')
            return res.redirect('back')
        } else {
            const subscriber = new subscribersModel({
                email: email
            })
            let nodeMailer = new NodeMailer();
            let to = email
            let subject = 'subscribe to newsletter'
            let htmlContent =  `
                <body style="background-color: black;">
                    <h1 style="color: green;">welcome to grovemade newsletter</h1> 
                    <p style="color: red;">we happy that you sign up with us</p>
                </body>
            `
            nodeMailer.sendMail(to, subject, htmlContent)
            console.log('email subscribed successfully')
            res.redirect('back')
            return subscriber.save()
        }
    }).catch(err => console.log(err))
}