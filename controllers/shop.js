// user shop pages routes
exports.getHome = (req, res, next) => {
    res.render('home', {
        pageTitle: 'Home',
        path: '/',
        isLoggedIn: req.session.isLoggedIn
    })
}
exports.getProducts = (req, res, next) => {
    res.render('products-page', {
        pageTitle: 'products',
        path: '/products',
        isLoggedIn: req.session.isLoggedIn
    })
}
exports.getProduct = (req, res, next) => {
    res.render('product-page', {
        pageTitle: 'product',
        path: '/product',
        isLoggedIn: req.session.isLoggedIn
    })
}
exports.getCart = (req, res, next) => {
    res.render('cart', {
        pageTitle: 'cart',
        path: '/cart',
        isLoggedIn: req.session.isLoggedIn
    })
}
exports.getContactUs = (req, res, next) => {
    res.render('contact-us', {
        pageTitle: 'contact-us',
        path: '/contact-us',
        isLoggedIn: req.session.isLoggedIn
    })
}
exports.getFaq = (req, res, next) => {
    res.render('faq', {
        pageTitle: 'faq',
        path: '/faq',
        isLoggedIn: req.session.isLoggedIn
    })
}
exports.getWishlist = (req, res, next) => {
    res.render('wishlist', {
        pageTitle: 'wishlist',
        path: '/wishlist',
        isLoggedIn: req.session.isLoggedIn
    })
}