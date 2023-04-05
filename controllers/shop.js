const productModel = require('../models/products')
const subscribersModel = require('../models/subscribers')
const userModel = require('../models/user')
const orderModel = require('../models/order')
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

//? fetch all products
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

//? fetch laptop stands products page
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
//? fetch desk pads products page
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

//? fetch the product user click on on product page
exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    console.log('productId:' + productId);
    productModel.findById(productId)
    .then(product => {
        console.log(product.mainImagesPath)
        const category = product.category
        console.log(product.quantity)
        productModel.find({ category: category, _id:{ $ne: productId}}).limit(3)
        .then(similarProduct => {
                res.render('product-page', {
                    pageTitle: 'product',
                    path: '/product',
                    prod: product,
                    similarProds: similarProduct,
                });
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
}









exports.getCart = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    req.user
    .populate({
        path: 'cart.items.productId',
        model: 'products'
    })
    .then(user => {
        const Products = user.cart.items
        let totalPrice = 0;
        for (let i = 0; i < Products.length; i++) {
            const product = Products[i].productId;
            const quantity = Products[i].quantity;
            const price = product.priceSold;
            totalPrice += quantity * price;
        }
        accountId = req.session.user
        userModel.findById(accountId)
        .then(userData => {
            res.render('cart', {
                pageTitle: 'cart',
                path: '/cart',
                products: Products,
                totalPrice: totalPrice,
                errorMessage: message,
                userData: userData
            })
        }).catch(err => console.log(err))
        console.log(accountId)
        console.log(totalPrice);
        console.log(Products)
    }).catch(err => console.error(err))
}



exports.getContactUs = (req, res, next) => {
    res.render('contact-us', {
        pageTitle: 'contact-us',
        path: '/contact-us',
    })
}
exports.getThankYou = (req, res, next) => {
    res.render('thank-you', {
        pageTitle: 'thank-you',
        path: '/thank-you',
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

//? add products to cart
exports.postAddToCart = (req, res, next) => {
    const productId = req.body.productId
    console.log(productId)
    productModel.findById(productId)
    .then(product => {
        return req.user.addToCart(product)
    })
    .then(result => {
        console.log(result)
        res.redirect('/cart')
    })
    .catch(err => {
        console.log(err)
    })
}

//? delete products from cart
exports.postDeleteFromCart = (req, res, next) => {
    const productId = req.body.productId
    console.log(productId)
    req.user.removeFromCart(productId)
    .then((result) => {
        res.redirect('back')
        console.log('Product:' + productId + ' deleted successfully from cart')
    })
    .catch((err) => {
        console.log(err)
    })
};

//? checkout
exports.postCheckout = (req, res, next) => {
    if (req.user.cart.items.length === 0) {
        console.log('empty cart')
        req.flash('error', 'your cart is empty add a product to checkout')
        return res.redirect('back')
    }
    req.user
    .populate(
        'cart.items.productId'
    )
    .then(user => {
        console.log(user.cart.items)
        const Products = user.cart.items.map(i => {
            return {
                quantity: i.quantity, 
                product: { ...i.productId._doc }
            }
        })
        const productUpdates = Products.map(item => {
            return productModel.findByIdAndUpdate(
                item.product._id,
                { $inc: { quantity: -item.quantity, sold: item.quantity  }}
            )
        })
        return Promise.all(productUpdates)
        .then(() => {
            const order = new orderModel({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: Products
            })
            let nodeMailer = new NodeMailer();
            let to = req.user.email
            let subject = 'purchase'
            let htmlContent =  `
                <body style="background-color: black;">
                    <h1 style="color: green;">thank you for bying from grovemade</h1> 
                    <h2 style="color: red;">your purchase id is: ${order._id}</h2>
                </body>
            `
            nodeMailer.sendMail(to, subject, htmlContent)
            console.log('email for purchase successfully sent')
            return order.save()
        })
    })
    .then(result => {
        return req.user.clearCart()
    })
    .then(() => {
        res.redirect('/thank-you')
    })
    .catch(err => console.log(err))
};


 