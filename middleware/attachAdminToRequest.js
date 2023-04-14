const adminModel = require('../models/admin')

const attachAdminModel = (req, res, next) => {
    if (!req.session.admin) {
        return next()
    }
    adminModel.findById(req.session.admin)
    .then((admin) => {
        if (!admin) {
            return next()
        }
        req.admin = admin
        next()
    })
    .catch((error) => {
        next(error)
    })
}
module.exports = attachAdminModel