const productModel = require('../models/products')

// user shop pages routes
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