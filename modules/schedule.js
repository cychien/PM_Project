var mysql = require('mysql');

var dbconfig = require('../config/database');
var pool = mysql.createPool(dbconfig.connection);

// connection.connect();

exports.home = (req, res, next) => {
    var data = {};

    var promise = new Promise((resolve, reject) => {
            pool.getConnection(function (err, connection) {
                var sql = 'SELECT `order`.id as `orderId`,customer.id as customerId,customer.name, GROUP_CONCAT(product.name) as product,\
					sum(include.price*include.qty) as total,\
					DATE_ADD(`order`.estimated_arrived_date,INTERVAL -1 day) as estimatedShippedDay\
					FROM pmproject.customer,`order`,include,make,product\
					where order.id=include.order_id\
					and make.customer_id=customer.id\
					and make.order_id=`order`.id\
					and product.id = include.product_id\
					group by `order`.id;'
                connection.query(sql, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    var schedules = [];

                    for (let i = 0; i < result.length; i++) {
                        let schedule = {};
                        ({
                            orderId: schedule.order_id,
                            name: schedule.customer_name,
                            product: schedule.order_product,
                            total: schedule.order_total,
                            estimatedShippedDay: schedule.estimated_ship_date
                        } = result[i]);
                        schedules.push(schedule);
                    }
                    data.order_schedule = schedules;
                    connection.release();
                    resolve();
                });
            });

        }).then(() => {

            //先找立即過期的ingredient
            var ingredientSchedules = [];

            return new Promise((resolve, reject) => {
                pool.getConnection(function (err, connection) {
                    var sql = 'SELECT ingredient.id,ingredient.name,inventory,eoq,\
							current_date() as `dateToPurchase`,\
							DATE_ADD(current_date(), interval ((inventory-safe_inventory)/day_demand)+lead_time DAY) as `dateToArrive`\
							FROM pmproject.ingredient\
							where inventory<safe_inventory;'

                    connection.query(sql, function (error, result) {
                        if (error) {
                            throw error;
                        }

                        for (let i = 0; i < result.length; i++) {
                            let ingredientSchedule = {};
                            ({
                                name: ingredientSchedule.ingredient_name,
                                inventory: ingredientSchedule.remaining_inventory,
                                eoq: ingredientSchedule.estimated_quantity,
                                dateToPurchase: ingredientSchedule.estimated_order_date,
                                dateToArrive: ingredientSchedule.estimated_arrived_date

                            } = result[i]);
                            ingredientSchedules.push(ingredientSchedule);
                        }
                        data.ingredient_schedule = ingredientSchedules;
                        connection.release();
                        resolve();
                    });
                });
            });
        })
        .then(() => {
            return new Promise((resolve, reject) => {
                pool.getConnection(function (err, connection) {
                    var sql = 'SELECT ingredient.id,ingredient.name,inventory,eoq,\
							DATE_ADD(current_date(), interval ((inventory-safe_inventory)/day_demand) DAY) as `dateToPurchase`,\
							DATE_ADD(current_date(), interval ((inventory-safe_inventory)/day_demand)+lead_time DAY) as `dateToArrive`\
							FROM pmproject.ingredient\
							where inventory>safe_inventory and ((inventory-safe_inventory)/day_demand)<3;'

                    connection.query(sql, function (error, result) {
                        if (error) {
                            throw error;
                        }

                        for (let i = 0; i < result.length; i++) {
                            let ingredientSchedule = {};
                            ({
                                name: ingredientSchedule.ingredient_name,
                                inventory: ingredientSchedule.remaining_inventory,
                                eoq: ingredientSchedule.estimated_quantity,
                                dateToPurchase: ingredientSchedule.estimated_order_date,
                                dateToArrive: ingredientSchedule.estimated_arrived_date

                            } = result[i]);
                            data.ingredient_schedule.push(ingredientSchedule);
                        }
                        connection.release();
                        resolve();
                    });
                });
            });

        })

        .then(() => {
            res.render('company/schedule', data);
        });
}