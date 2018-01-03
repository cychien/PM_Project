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

            var sql = "SELECT customer.id, customer.name,max(`order`.date) as R, datediff(now(),min(`order`.date))/30 as `interval`,\
        count(Distinct make.order_id) / (datediff(now(), min(`order`.date)) / 30) as F,\
            sum(price * qty) / (datediff(now(), min(`order`.date)) / 30) as M\
        FROM customer, `order`, make, include\
        where customer.id = make.customer_id AND\
        order.id = make.order_id\
        AND make.order_id = include.order_id\
        group by customer.name";

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

                //分組
                //以 R 分
                var RTeam = [];

                var size = customers.length;
                var start = 0;
                var step = Math.floor(size / 3);
                customers.sort(function (a, b) {
                    return b.r - a.r;
                });

                for (let index = 1; index <= 3; index++) {
                    RTeam.push([]);
                    let terminate = start + step;
                    if (index === 3)
                        terminate = size;
                    for (let i = start; i < terminate; i++) {
                        //新增RTeam欄位
                        customers[i].RTeam = index;
                        //創造小分組: RTeam
                        RTeam[RTeam.length - 1].push(customers[i]);
                    }
                    start += step;
                }

                //以 F 分
                var FTeam = [];

                for (let teamIndex = 0; teamIndex < 3; teamIndex++) {
                    FTeam.push([]);
                    size = RTeam[teamIndex].length;
                    start = 0;
                    step = Math.floor(size / 3);
                    RTeam[teamIndex].sort(function (a, b) {
                        return b.f - a.f;
                    });

                    for (let index = 1; index <= 3; index++) {
                        FTeam[FTeam.length - 1].push([]);
                        let terminate = start + step;
                        if (index === 3)
                            terminate = size;
                        for (let i = start; i < terminate; i++) {
                            let FId = RTeam[teamIndex][i].id;
                            //新增FTeam欄位
                            for (let j = 0; j < customers.length; j++) {
                                if (customers[j].id === FId) {
                                    customers[j].FTeam = index;
                                    //創造小分組: FTeam
                                    FTeam[FTeam.length - 1][FTeam[FTeam.length - 1].length - 1].push(customers[j]);
                                }
                            }
                        }
                        start += step;
                    }
                }


                //以 M 分
                for (let teamIndex = 0; teamIndex < 3; teamIndex++) {
                    for (let teamIndex2 = 0; teamIndex2 < 3; teamIndex2++) {
                        size = FTeam[teamIndex][teamIndex2].length;
                        start = 0;
                        step = Math.floor(size / 3);
                        FTeam[teamIndex][teamIndex2].sort(function (a, b) {
                            return b.m - a.m;
                        });

                        for (let index = 1; index <= 3; index++) {
                            let terminate = start + step;
                            if (index === 3)
                                terminate = size;
                            for (let i = start; i < terminate; i++) {
                                let MId = FTeam[teamIndex][teamIndex2][i].id;
                                //新增FTeam欄位
                                for (let j = 0; j < customers.length; j++) {
                                    if (customers[j].id === MId) {
                                        customers[j].MTeam = index;
                                    }
                                }
                            }
                            start += step;
                        }
                    }
                }

                customers.sort(function (a, b) {
                    if (b.RTeam - a.RTeam != 0)
                        return a.RTeam - b.RTeam;
                    if (b.FTeam - a.FTeam != 0)
                        return a.FTeam - b.FTeam;
                    if (b.MTeam - a.MTeam != 0)
                        return a.MTeam - b.MTeam;
                    else
                        return 0;
                });

                data.customers = customers;
                resolve();
            });
        })
        .then(() => {
            (function loop(i) {
                let r = data.customers[i].RTeam;
                let f = data.customers[i].FTeam;
                let m = data.customers[i].MTeam;
                const promise = new Promise((resolve, reject) => {
                    var sql = `UPDATE customer SET rfm_r=${r},rfm_f=${f},rfm_m=${m} WHERE id=${data.customers[i].id};`;
                    connection.query(sql, (error, result) => {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                }).then(() => i >= data.customers.length || loop(i + 1));
            })(0);
        })
        .then(() => {
            var teamInfo = [];
            return new Promise((resolve, reject) => {
                var sql = "SELECT CONCAT(customer.rfm_r,customer.rfm_f,customer.rfm_m ) AS Team,sum(include.qty) as totalNumber,count(distinct customer.id) AS response\
                FROM pmproject.customer, `order`, include, make\
                where`order`.id = include.order_id\
                and make.customer_id = customer.id\
                and make.order_id = `order`.id\
                and include.product_id = 1\
                and`order`.date between '2017-11-01 00:00:00.000' and '2017-11-30 00:00:00.000'\
                group by customer.rfm_r, customer.rfm_f, customer.rfm_m";
                connection.query(sql, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    for (let i = 0; i < result.length; i++) {
                        let team = result[i].Team;
                        let aTeam = {};
                        aTeam.team = team;
                        aTeam.response = result[i].response;
                        teamInfo.push(aTeam);
                        data.teamInfo = teamInfo;
                    }
                    resolve();
                });
            })
        })
        .then(() => {
            return new Promise((resolve, reject) => {
                var sql = 'select CONCAT(customer.rfm_r,customer.rfm_f,customer.rfm_m )\
                 as group_id ,count(*) as number from customer group by rfm_r,rfm_f,rfm_m';
                connection.query(sql, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    for (let i = 1; i < result.length; i++) {
                        let team = result[i].group_id;
                        for (let j = 0; j < data.teamInfo.length; j++) {
                            if (data.teamInfo[j].team === team) {
                                data.teamInfo[j].response = data.teamInfo[j].response / result[i].number;
                                break;
                            }
                        }
                    }
                    console.log(data.teamInfo);
                    res.render('company/crm', data);
                    resolve();
                });
            });
        })
        .catch((error) => {
            console.log(error);
        });
}