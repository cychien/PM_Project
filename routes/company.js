var express = require('express');
var router = express.Router();
var IM = require('../modules/ingredient-management.js');
var CRM = require('../modules/crm.js');

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('company/index', {
        title: '管理頁面'
    });
});

router.get('/crm', CRM.home);

router.get('/ingredient-management', IM.home);
router.post('/ingredient-management/process', IM.process);

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