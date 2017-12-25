var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "scl.mysql.database.azure.com",
    user: "admin1104@scl",
    password: 'Qwert@1234',
    database: 'pmproject',
    port: 3306,
});

connection.connect();

/* GET home page. */
router.get('/index', function (req, res, next) {
    res.render('company/index', {
        title: '管理頁面'
    });
});

router.get('/crm', function (req, res, next) {
    res.render('company/crm', {
        title: '顧客關係管理'
    });
});

router.get('/ingredient-management', function (req, res, next) {

    var sql = 'SELECT * FROM product';

    connection.query(sql, function (error, result) {
        if (error) {
            throw error;
        }
        console.log(result[0]);
    });

    connection.end();

    var data = {
        ingredient_name: '原料管理',
        ingredient_price: '677'
    }

    res.render('company/ingredient-management', data);
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