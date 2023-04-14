const attachAdminModel = require('../middleware/attachAdminToRequest')
module.exports = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.redirect('/dash/signIn')
    }
    attachAdminModel(req, res, next, () => {
        if (!req.admin) {
            return res.redirect('/dash/signIn')
        }
        next()
    })
}