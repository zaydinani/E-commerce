const attachUserToRequest = require('../middleware/attachUserToRequest')
module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/sign-in')
    }
    attachUserToRequest(req, res, next, () => {
        if (!req.user) {
            return res.redirect('/sign-in')
        }
        next()
    })
}