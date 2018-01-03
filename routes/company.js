var express = require('express');
var router = express.Router();
var IM = require('../modules/ingredient-management.js');
var CRM = require('../modules/crm.js');
var SC = require('../modules/schedule.js');
/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('company/index', {
        title: '管理頁面'
    });
});

router.get('/crm', CRM.home);

router.get('/ingredient-management', IM.home);
router.post('/ingredient-management/process', IM.process);

router.get('/schedule', SC.home);

module.exports = router;