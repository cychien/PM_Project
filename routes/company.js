var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var IM = require('../modules/ingredient-management.js');

var AM = require('./modules/account-manager');

var connection = mysql.createConnection({
    host: "scl3.mysql.database.azure.com",
    user: "admin1104@scl3",
    password: 'Qwert@1234',
    database: 'pmproject',
    port: 3306,
});

connection.connect();

/* GET home page. */
router.get('/', function (req, res, next) {

    // main login page //
    app.get('/', function (req, res) {
        // check if the user's credentials are saved in a cookie //
        if (req.cookies.user == undefined || req.cookies.pass == undefined) {
            res.render('login', {});
        } else {
            // attempt automatic login //
            AM.autoLogin(req.cookies.user, req.cookies.pass, function (o) {
                if (o != null) {
                    req.session.user = o;
                    res.redirect('/home');
                } else {
                    res.render('login', {
                        title: 'Hello - Please Login To Your Account'
                    });
                }
            });
        }
    });


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
                    id: ingredientKind.id,
                    name: ingredientKind.name,
                } = result[i]);
                ingredientKinds.push(ingredientKind);
            }

            data.ingredients = ingredients;

            data.ingredientKinds = ingredientKinds;

            resolve();
        });
    });

    //利用ingredient id尋找每樣ingredient的purchase date
    promise.then(() => {
        var outOfInventoryIngredients = [];

        return new Promise((resolve, reject) => {
			var sql = 'SELECT ingredient.id,ingredient.name,inventory,safe_inventory,day_demand, supplier.name AS supplierName FROM pmproject.ingredient,pmproject.supplier\
						   where inventory<safe_inventory and supplier.id=ingredient.supplier_id';
                connection.query(sql, function (error, result) {
                    if (error) {
                        throw error;
                    }
					
					for (let i = 0; i < result.length; i++) {
						let outOfInventoryIngredient = {};
						({
						name: outOfInventoryIngredient.name,
						supplierName: outOfInventoryIngredient.supplier
						} = result[i]);
						outOfInventoryIngredients.push(outOfInventoryIngredient);
					}
					data.outOfInventoryIngredients = outOfInventoryIngredients;
					resolve();
                });
		});
                

    })
	.then(() => {
		var closeToROPIngredients = [];
		
		return new Promise((resolve, reject) => {
                var sql = 'SELECT id,name,inventory,safe_inventory,day_demand,((inventory-safe_inventory)/day_demand) AS dayRatio FROM pmproject.ingredient\
							where inventory>safe_inventory and ((inventory-safe_inventory)/day_demand)<3;'
                connection.query(sql, function (error, result) {
                    if (error) {
                        throw error;
                    }

					for (let i = 0; i < result.length; i++) {
						let closeToROPIngredient = {};
						({
						name: closeToROPIngredient.name
						} = result[i]);
						closeToROPIngredient.dayRatio = Math.ceil(result[i].dayRatio);
						closeToROPIngredients.push(closeToROPIngredient)
					}
					data.closeToROPIngredients = closeToROPIngredients;
					resolve();
                });
				});
    })
	.then(() => {
		res.render('company/ingredient-management', data);
	})
	.catch((e) => {
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