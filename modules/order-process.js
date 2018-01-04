var mysql = require('mysql');

var dbconfig = require('../config/database');
var pool = mysql.createPool(dbconfig.connection);

exports.process = (req, res) => {
    var itemObj = JSON.parse(req.body.itemList);

    var items = [0, 0, 0];
    for (let i = 0; i < itemObj.length - 1; i++) {
        if (itemObj[i] === '奶凍捲')
            items[0] = items[0] + 1;
        if (itemObj[i] === '牛軋糖')
            items[1] = items[1] + 1;
        if (itemObj[i] === '鳳梨酥')
            items[2] = items[2] + 1;
    }

    var arrivedDate = itemObj[itemObj.length - 1] + " 21:00:00.000000";

    var date;
    date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2) + ' ' +
        ('00' + date.getUTCHours()).slice(-2) + ':' +
        ('00' + date.getUTCMinutes()).slice(-2) + ':' +
        ('00' + date.getUTCSeconds()).slice(-2);

    var customerId = req.user.id;
    var orderId = 0;

    var promise = new Promise((resolve, reject) => {
            pool.getConnection(function (err, connection) {
                var sql = "insert into `order`(`date`,`estimated_arrived_date`) values(?,?)";
                connection.query(sql, [date, arrivedDate], (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    connection.release();
                    resolve();
                });
            });
        })
        .then(data => {
            return new Promise((resolve, reject) => {
                pool.getConnection(function (err, connection) {
                    var sql = "select max(`order`.id) as id from `order`";
                    connection.query(sql, (error, result) => {
                        if (error) {
                            reject(error);
                        }
                        orderId = result[0].id;
                        connection.release();
                        resolve();
                    });
                });
            });
        })
        .then(data => {
            return new Promise((resolve, reject) => {
                pool.getConnection(function (err, connection) {
                    var sql = "insert into `make`(`order_id`,`customer_id`) values(?, ?);";
                    connection.query(sql, [orderId, customerId], (error, result) => {
                        if (error) {
                            reject(error);
                        }
                        connection.release();
                        resolve();
                    });
                });
            });
        })
        .then(data => {
            return new Promise((resolve, reject) => {
                if (items[0] !== 0) {
                    pool.getConnection(function (err, connection) {
                        var sql = "insert into `include`(`order_id`,`product_id`,`price`,`qty`) values(?,?,?,?)";
                        connection.query(sql, [orderId, 1, 150, items[0]], (error, result) => {
                            if (error) {
                                reject(error);
                            }
                            connection.release();

                            if (items[1] !== 0) {
                                pool.getConnection(function (err, connection) {
                                    var sql = "insert into `include`(`order_id`,`product_id`,`price`,`qty`) values(?,?,?,?)";
                                    connection.query(sql, [orderId, 3, 350, items[1]], (error, result) => {
                                        if (error) {
                                            reject(error);
                                        }
                                        connection.release();

                                        if (items[2] !== 0) {
                                            pool.getConnection(function (err, connection) {
                                                var sql = "insert into `include`(`order_id`,`product_id`,`price`,`qty`) values(?,?,?,?)";
                                                connection.query(sql, [orderId, 2, 120, items[2]], (error, result) => {
                                                    if (error) {
                                                        reject(error);
                                                    }
                                                    connection.release();
                                                    resolve();
                                                });
                                            });
                                        } else
                                            resolve();
                                    });
                                });
                            } else
                                resolve();
                        });
                    });
                } else
                    resolve();
            });
        })
        .then(data => {
            return new Promise((resolve, reject) => {
                if (items[0] !== 0) {
                    pool.getConnection(function (err, connection) {
                        var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[0]*0.5 } WHERE ingredient.id = 10`;
                        connection.query(sql, (error, result) => {
                            if (error) {
                                reject(error);
                            }
                            connection.release();

                            pool.getConnection(function (err, connection) {
                                var sql = `UPDATE ingredient SET inventory = inventory-
                                ${ items[0] * 0.1} WHERE ingredient.id = 1`;
                                connection.query(sql, (error, result) => {
                                    if (error) {
                                        reject(error);
                                    }
                                    connection.release();
                                    pool.getConnection(function (err, connection) {
                                        var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[0] * 0.5} WHERE ingredient.id = 11`;
                                        connection.query(sql, (error, result) => {
                                            if (error) {
                                                reject(error);
                                            }
                                            connection.release();
                                            pool.getConnection(function (err, connection) {
                                                var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[0] * 0.125} WHERE ingredient.id = 2`;
                                                connection.query(sql, (error, result) => {
                                                    if (error) {
                                                        reject(error);
                                                    }
                                                    connection.release();
                                                    pool.getConnection(function (err, connection) {
                                                        var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[0] * 0.05} WHERE ingredient.id = 3`;
                                                        connection.query(sql, (error, result) => {
                                                            if (error) {
                                                                reject(error);
                                                            }
                                                            connection.release();
                                                            pool.getConnection(function (err, connection) {
                                                                var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[0] * 0.02} WHERE ingredient.id = 4`;
                                                                connection.query(sql, (error, result) => {
                                                                    if (error) {
                                                                        reject(error);
                                                                    }
                                                                    connection.release();
                                                                    pool.getConnection(function (err, connection) {
                                                                        var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[0] * 0.05} WHERE ingredient.id = 5`;
                                                                        connection.query(sql, (error, result) => {
                                                                            if (error) {
                                                                                reject(error);
                                                                            }
                                                                            connection.release();
                                                                            pool.getConnection(function (err, connection) {
                                                                                var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[0] * 0.125} WHERE ingredient.id = 12`;
                                                                                connection.query(sql, (error, result) => {
                                                                                    if (error) {
                                                                                        reject(error);
                                                                                    }
                                                                                    connection.release();
                                                                                    resolve();
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                } else
                    resolve();
            });
        })
        .then(data => {
            return new Promise((resolve, reject) => {
                if (items[1] !== 0) {




                    //3
                    pool.getConnection(function (err, connection) {
                        var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[1] * 0.5} WHERE ingredient.id = 7`;
                        connection.query(sql, (error, result) => {
                            if (error) {
                                reject(error);
                            }
                            connection.release();
                            pool.getConnection(function (err, connection) {
                                var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[1] * 0.2} WHERE ingredient.id = 2`;
                                connection.query(sql, (error, result) => {
                                    if (error) {
                                        reject(error);
                                    }
                                    connection.release();
                                    pool.getConnection(function (err, connection) {
                                        var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[1] * 0.1} WHERE ingredient.id = 9`;
                                        connection.query(sql, (error, result) => {
                                            if (error) {
                                                reject(error);
                                            }
                                            connection.release();
                                            pool.getConnection(function (err, connection) {
                                                var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[1] * 0.25} WHERE ingredient.id = 8`;
                                                connection.query(sql, (error, result) => {
                                                    if (error) {
                                                        reject(error);
                                                    }
                                                    connection.release();
                                                    resolve();
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });


                } else
                    resolve();
            });
        })
        .then(data => {
            return new Promise((resolve, reject) => {
                if (items[2] !== 0) {


                    //2
                    pool.getConnection(function (err, connection) {
                        var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[2] * 0.06} WHERE ingredient.id = 3`;
                        connection.query(sql, (error, result) => {
                            if (error) {
                                reject(error);
                            }
                            connection.release();
                            pool.getConnection(function (err, connection) {
                                var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[2] * 0.125} WHERE ingredient.id = 2`;
                                connection.query(sql, (error, result) => {
                                    if (error) {
                                        reject(error);
                                    }
                                    connection.release();
                                    pool.getConnection(function (err, connection) {
                                        var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[2] * 0.04} WHERE ingredient.id = 1`;
                                        connection.query(sql, (error, result) => {
                                            if (error) {
                                                reject(error);
                                            }
                                            connection.release();
                                            pool.getConnection(function (err, connection) {
                                                var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[2] * 0.1} WHERE ingredient.id = 11`;
                                                connection.query(sql, (error, result) => {
                                                    if (error) {
                                                        reject(error);
                                                    }
                                                    connection.release();

                                                    pool.getConnection(function (err, connection) {
                                                        var sql = `UPDATE ingredient SET inventory = inventory-
                        ${ items[2] * 0.2} WHERE ingredient.id = 6`;
                                                        connection.query(sql, (error, result) => {
                                                            if (error) {
                                                                reject(error);
                                                            }
                                                            connection.release();
                                                            resolve();
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });


                } else
                    resolve();
            });
        })
        .then(data => {
            res.redirect('/profile');
        });
}