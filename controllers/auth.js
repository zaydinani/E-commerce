const userModel = require('../models/user')
const bcrypt = require('bcryptjs')
//user authentication and registration routes
exports.getSignUp = (req, res, next) => {
    res.render('sign-up', {
        pageTitle: 'Sign Up',
        path: '/sign-up',
        errMsg: false,
        isLoggedIn: req.session.isLoggedIn
    });
}
exports.getSignIn = (req, res, next) => {
    res.render('sign-in', {
        pageTitle: 'Sign In',
        path: '/sign-in',
        errMsg: false,
        isLoggedIn: req.session.isLoggedIn
    });
}
// sign up function
exports.postSignUp = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    console.log(name, email, password, confirmPassword)
    userModel.findOne({ email: email})
    .then(userDoc => {
        if (userDoc) {
            return res.render('sign-up', {
                errMsg: 'Email already exists',
                isLoggedIn: req.session.isLoggedIn
            });
        }else if (password!== confirmPassword) {
            return res.render('sign-up', {
                errMsg:'Passwords do not match',
                isLoggedIn: req.session.isLoggedIn,
            });
        } 
        else {
            return bcrypt.hash(password, 10)
            .then(hashedPassword => {
                const user = new userModel({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    cart: {items: []},
                });
                console.log(user)
                res.redirect('/sign-in')
                return user.save()
            }).catch(err => {
                console.log(err)
            })
        }
    }).catch(err => {
        console.log(err)
    })
};



//sign in function 
exports.postSignIn = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    console.log(email, password)
    userModel.findOne({ email: email})
        .then(user => {
            if (!user) {
                return res.render('sign-in', {
                    errMsg:'invalid email',
                    isLoggedIn: req.session.isLoggedIn
                })
            }
            bcrypt.compare(password, user.password)
            .then(doMatch => {
                if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                    res.redirect('/')
                })
            }
            res.render('sign-in', {
                errMsg:'invalid password',
                isLoggedIn: req.session.isLoggedIn
            });
            })
            .catch(err => {
                console.log(err)
            });
        })
        .catch(err => {
            console.log(err)
        });
}