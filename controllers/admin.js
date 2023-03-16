// dashboard routes
exports.getDashboard = (req, res, next) => {
    res.render('./admin/dashboard-main', {
        pageTitle: 'dashboard',
        path: '/dash',
        isLoggedIn: req.session.isLoggedIn
    });
};

exports.getAdminDashboard = (req, res, next) => {
    res.render('./admin/dashboard-admins', {
        pageTitle: 'dashboard-admins',
        path: '/dash/admin',
        isLoggedIn: req.session.isLoggedIn
    })
};

exports.getCustomersDashboard = (req, res, next) => {
    res.render('./admin/dash-customers', {
        pageTitle: 'dashboard-customers',
        path: '/dash/customers',
        isLoggedIn: req.session.isLoggedIn
    })
};

exports.getProductsDashboard = (req, res, next) => {
    res.render('./admin/dashboard-products', {
        pageTitle: 'dashboard-products',
        path: '/dash/products',
        isLoggedIn: req.session.isLoggedIn
    })
};

exports.getOrdersDashboard = (req, res, next) => {
    res.render('./admin/dashboard-orders', {
        pageTitle: 'dashboard-orders',
        path: '/dash/orders',
        isLoggedIn: req.session.isLoggedIn
    })
};
exports.getSellersDashboard = (req, res, next) => {
    res.render('./admin/dashboard-sellers', {
        pageTitle: 'dashboard-sellers',
        path: '/dash/seller',
        isLoggedIn: req.session.isLoggedIn
    })
};