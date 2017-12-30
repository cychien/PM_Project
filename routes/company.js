var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var IM = require('../modules/ingredient-management.js');

var connection = mysql.createConnection({
    host: "scl3.mysql.database.azure.com",
    user: "admin1104@scl3",
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

    var sql = 'SELECT customer.id, customer.name,max(`order`.date) FROM customer,\
     `order`, make where customer.id=make.customer_id AND `order`.id=make.order_id \
     group by customer.name';

    connection.query(sql, function (error, result) {
        if (error) {
            throw error;
        }
        var customers = [];

        for (let i = 0; i < result.length; i++) {

        }
    });

    res.render('company/crm', {
        title: '顧客關係管理'
    });
});

router.get('/ingredient-management', function (req, res, next) {

    var data = {};

    //找尋所有ingredient的資訊
    var promise = new Promise((resolve, reject) => {
        var sql = 'SELECT * FROM ingredient';
        connection.query(sql, (error, result) => {
            if (error) {
                reject(error);
            }
            var ingredients = [];
            var ingredientKinds = [];

            for (let i = 0; i < result.length; i++) {
                let ingredient = {};
                ({
                    id: ingredient.id,
                    name: ingredient.name,
                    inventory: ingredient.inventory,
                    safe_inventory: ingredient.safeInventory
                } = result[i]);
                ingredients.push(ingredient);

                let ingredientKind = {};
                ({
                    id: ingredient.id,
                    name: ingredient.name,
                } = result[i]);
                ingredientKinds.push(ingredientKind);
            }

            data.ingredients = ingredients;

            data.ingredientKinds = ingredientKinds;

            resolve(ingredients);
        });
    });

    //利用ingredient id尋找每樣ingredient的purchase date
    promise.then((ingredients) => {
        var outOfInventoryIngredients = [];

        (function loop(i) {
            const promise = new Promise((resolve, reject) => {
                var sql = ''
                connection.query(sql, function (error, result) {
                    if (error) {
                        throw error;
                    }

                    let outOfInventoryIngredient = {};
                    //callback，purchase date寫在這!
                    outOfInventoryIngredients.push(outOfInventoryIngredient);
                    resolve();
                });
            }).then(() => i >= ingredients.length - 1 || loop(i + 1));
        })(0);

        connection.end();
        data.outOfInventoryIngredients = outOfInventoryIngredients;
        res.render('company/ingredient-management', data);
    }).catch((e) => {
        console.log(e)
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