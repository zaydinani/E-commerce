const userModel = require('../models/user')

const attachUserModel = (req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    userModel.findById(req.session.user)
    .then((user) => {
        if (!user) {
            return next()
        }
        req.user = user
        next()
    })
    .catch((error) => {
        next(error)
    })
}
module.exports = attachUserModel