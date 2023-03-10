// dashboard routes
exports.getDashboard = (req, res, next) => {
    res.render('./dashboard/dashboard-main', {
        pageTitle: 'dashboard',
        path: '/dash'
    });
};

exports.getAdminDashboard = (req, res, next) => {
    res.render('./dashboard/dashboard-admins', {
        pageTitle: 'dashboard-admins',
        path: '/dash/admin'
    })
};

exports.getCustomersDashboard = (req, res, next) => {
    res.render('./dashboard/dash-customers', {
        pageTitle: 'dashboard-customers',
        path: '/dash/customers'
    })
};

exports.getProductsDashboard = (req, res, next) => {
    res.render('./dashboard/dashboard-products', {
        pageTitle: 'dashboard-products',
        path: '/dash/products'
    })
};

exports.getOrdersDashboard = (req, res, next) => {
    res.render('./dashboard/dashboard-orders', {
        pageTitle: 'dashboard-orders',
        path: '/dash/orders'
    })
};
exports.getSellersDashboard = (req, res, next) => {
    res.render('./dashboard/dashboard-sellers', {
        pageTitle: 'dashboard-sellers',
        path: '/dash/seller'
    })
};