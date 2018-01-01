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

    var promise = new Promise((resolve, reject) => {

        var customers = [];

        var sql = 'SELECT customer.id, customer.name,max(order.date) as R,count( Distinct\
         make.order_id) as F, sum(price*qty) as M FROM customer, `order`, make, include\
         where customer.id = make.customer_id AND order.id = make.order_id AND\
         make.order_id = include.order_id group by customer.name';

        connection.query(sql, function (error, result) {
            if (error) {
                reject(error);
            }
            for (let i = 0; i < result.length; i++) {
                let customer = {};
                ({
                    id: customer.id,
                    name: customer.name,
                    R: customer.r,
                    F: customer.f,
                    M: customer.m
                } = result[i]);
                customers.push(customer);
            }
            for (let i = 0; i < customers.length; i++) {

            }
            resolve();
        });
    });


    // data.customers = customers;
    res.render('company/crm');
}