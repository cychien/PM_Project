var mysql = require('mysql');

var connection = mysql.createConnection({
    host: "scl3.mysql.database.azure.com",
    user: "admin1104@scl3",
    password: 'Qwert@1234',
    database: 'pmproject',
    port: 3306,
});

connection.connect();

exports.home = (req, res, next) => {

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
                    safe_inventory: ingredient.safeInventory,
                    eoq: ingredient.eoq
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

    //尋找每樣ingredient的purchase date
    promise.then(() => {

            //先找立即過期的ingredient
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

            //後找幾天後到期的ingredient
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
        .catch((error) => {
            console.log(error)
        });
}

exports.process = (req, res, next) => {
    var promise1 = new Promise((resolve, reject) => {
        let sql = `INSERT INTO supply(ingredient_id, qty, date, unit_cost) VALUES(
        ${req.body.ingredientName}, ${req.body.purchaseQuantity}, '${req.body.purchaseDate}', 
        ${req.body.unitCost})`;

        connection.query(sql, (error) => {
            if (error)
                throw error;
            resolve();
        });
    });

    var promise2 = new Promise((resolve, reject) => {
        let sql = `UPDATE ingredient SET inventory = inventory+
        ${req.body.purchaseQuantity} WHERE ingredient.id = ${req.body.ingredientName}`;

        connection.query(sql, (error) => {
            if (error)
                throw error;
            resolve();
        });
    });

    Promise.all([promise1, promise2]).then(() => {
            req.session.flash = {
                title: '補貨資料填寫成功',
                ingredientName: `${req.body.ingredientName}`,
                purchaseQuantity: `${req.body.purchaseQuantity}`,
                purchaseDate: `${req.body.purchaseDate}`,
                unitCost: `${req.body.unitCost}`
            };
            res.redirect(303, '/company/ingredient-management');
        })
        .catch((error) => {
            console.log(error);
        });
}