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
    productModel.find({})
    .then(products => {
        res.render('products-page', {
            pageTitle: 'products',
            path: '/products',
            prods: products
        })
    }).catch(err => console.error(err));
}

exports.getLaptopStands = (req, res, next) => {
    categories = ['laptop stand', 'laptop riser', 'macBook dock']
    productModel.find({category: { $in: categories}})
    .then(products => {
        res.render('products-page', {
            pageTitle: 'LaptopStands',
            path: '/products',
            prods: products
        })
    }).catch(err => console.error(err));
}

exports.getDeskPads = (req, res, next) => {
    productModel.find({category: 'deskPad'})
    .then(products => {
        res.render('products-page', {
            pageTitle: 'LaptopStands',
            path: '/products',
            prods: products
        })
    }).catch(err => console.error(err));
}

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    console.log('productId:' + productId);
    productModel.findById(productId)
    .then(product => {
        console.log(product.mainImagesPath)
        const category = product.category
        productModel.find({ category: category, _id:{ $ne: productId}}).limit(3)
        .then(similarProduct => {
            res.render('product-page', {
                pageTitle: 'product',
                path: '/product',
                prod: product,
                similarProds: similarProduct
            })
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
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