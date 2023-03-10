//user authentication and registration routes
exports.getSignUp = (req, res, next) => {
    res.render('sign-up', {
        pageTitle: 'Sign Up',
        path: '/sign-up'
    });
}
exports.getSignIn = (req, res, next) => {
    res.render('sign-in', {
        pageTitle: 'Sign In',
        path: '/sign-in'
    });
}

