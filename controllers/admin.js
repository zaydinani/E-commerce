// dashboard routes
exports.getDashboard = (req, res, next) => {
    res.render('./admin/dashboard-main', {
        pageTitle: 'dashboard',
        path: '/dash'
    });
};

exports.getAdminDashboard = (req, res, next) => {
    res.render('./admin/dashboard-admins', {
        pageTitle: 'dashboard-admins',
        path: '/dash/admin'
    })
};

exports.getCustomersDashboard = (req, res, next) => {
    res.render('./admin/dash-customers', {
        pageTitle: 'dashboard-customers',
        path: '/dash/customers'
    })
};

exports.getProductsDashboard = (req, res, next) => {
    res.render('./admin/dashboard-products', {
        pageTitle: 'dashboard-products',
        path: '/dash/products'
    })
};

exports.getOrdersDashboard = (req, res, next) => {
    res.render('./admin/dashboard-orders', {
        pageTitle: 'dashboard-orders',
        path: '/dash/orders'
    })
};
exports.getSellersDashboard = (req, res, next) => {
    res.render('./admin/dashboard-sellers', {
        pageTitle: 'dashboard-sellers',
        path: '/dash/seller'
    })
};