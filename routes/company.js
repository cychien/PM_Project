var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/index', function (req, res, next) {
    res.render('company/company-index', {
        title: '管理頁面'
    });
});

router.get('/crm', function (req, res, next) {
    res.render('company/crm', {
        title: '顧客關係管理'
    });
});

router.get('/ingredient-management', function (req, res, next) {
    res.render('company/ingredient-management', {
        title: '原料管理'
    });
});

router.get('/schedule', function (req, res, next) {
    res.render('company/schedule', {
        title: '排程'
    });
});

router.get('/order-management', function (req, res, next) {
    res.render('company/order-management', {
        title: '訂單管理'
    });
});

module.exports = router;