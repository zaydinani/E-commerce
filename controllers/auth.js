const userModel = require('../models/user')
const bcrypt = require('bcryptjs');
const { response } = require('express');
//user authentication and registration routes
//! GET ROUTES
exports.getSignUp = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('sign-up', {
        pageTitle: 'Sign Up',
        path: '/sign-up',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: message
    });
}
exports.getSignIn = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('sign-in', {
        pageTitle: 'Sign In',
        path: '/sign-in',
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: message
    });
}
exports.getProfile = (req, res, next) => {
    let message = req.flash('success');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    //? getting user information
    accountId = req.session.user
    userModel.findById(accountId)
    .then(userData => {
        res.render('profile', {
            pageTitle: 'profile',
            path: '/profile',
            isLoggedIn: req.session.isLoggedIn,
            successMessage: message,
            userData: userData
        })
    }).catch(err => console.log(err))
}
//! POST ROUTES
//? user sign up function
exports.postSignUp = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    console.log(name, email, password, confirmPassword)
    userModel.findOne({ email: email})
    .then(userDoc => {
        if (userDoc) {
            req.flash('error', 'invalid email')
            return res.redirect('/sign-up');
        }else if (password!== confirmPassword) {
            req.flash('error', 'Passwords do not match')
            return res.redirect('/sign-up');
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
//? user sign in function 
exports.postSignIn = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    console.log(email, password)
    userModel.findOne({ email: email})
        .then(user => {
            if (!user) {
                req.flash('error', 'this email do not exists')
                return res.redirect('/sign-in')
            }
            bcrypt.compare(password, user.password)
            .then(doMatch => {
                if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user._id;
                return req.session.save(err => {
                    res.redirect('/')
                })
            }
            req.flash('error', 'invalid password')
            res.redirect('/sign-in');
            })
            .catch(err => {
                console.log(err)
            });
        })
        .catch(err => {
            console.log(err)
        });
}
//? user sign out
exports.postSignOut = (req, res, next) => {
    req.session.destroy(err => {
        console.log('user signed out')
        res.redirect('/')
    })
}
//? user delete account 
exports.postDeleteAccount = (req, res, next) => {
    accountId = req.session.user
    userModel.findByIdAndDelete({_id: accountId})
    .then(() => {
        console.log(`account id:${req.session.user} deleted`)
        req.session.destroy(err => {
            res.redirect('/')
        })
    })
    .catch(err => {
        console.log(err)
    })

}

//? user update account info
exports.postUpdateUserInfo = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    const city = req.body.city
    const street = req.body.street
    const building = req.body.building
    const apartment = req.body.apartment
    console.log(name, email, city, street, building, apartment)
    accountId = req.session.user
    console.log(accountId)
        userModel.findByIdAndUpdate(accountId,{$set: {
            name: name, 
            email: email, 
            address: {
                city: city, 
                street: street, 
                building: building, 
                apartmentNumber: apartment
                }
        }}
    ).then(() => {
        console.log(`account id:${req.session.user} updated`)
        req.flash('success', 'Account updated successfully')
        res.redirect('back')
    }).catch(err => {
        console.log(err)
    })

}
