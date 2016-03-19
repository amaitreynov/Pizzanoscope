var https = require('https');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var paypal = require('paypal-rest-sdk');
var Cookies = require("cookies");
var logger = require('log4js').getLogger('controller.product');
var config = require('../config.json');
var jwt = require('jsonwebtoken');

var OrderDB = require('../Models/OrderDB');
var Order = mongoose.model('Order');
var Pizza = mongoose.model('Pizza');
var User = mongoose.model('User');
var Class = mongoose.model('Class');

/* GET home page. */
router.get('/getAll', function (req, res) {
    //todo add some ajax to give user feedback while loading the pizzas ?
        var orderCookie = new Cookies(req, res).get('order');
        var optionsget = {
            host: 'services.dominos.com.au',
            path: '/Rest/fr/menus/31740/products',
            method: 'GET'
        };
        var getData = https.request(optionsget, function (data) {
            var body = '';
            data.on('data', function (resx) {
                body += resx;
            });
            data.on('end', function () {
                logger.info('ending http request');
                var bodyParsed = JSON.parse(body);
                var pizzas = bodyParsed.MenuPages[1].SubMenus;
                var token = new Cookies(req, res).get('access_token');
                var user = jwt.decode(token, config.secret);
                if(orderCookie == undefined || orderCookie == null)
                    res.render('Pizza/pizza', {menus: pizzas, orderCookies: "", user: user});
                else
                    res.render('Pizza/pizza', {menus: pizzas, orderCookies: JSON.parse(orderCookie), user: user});
            });
        });

        getData.end();

        getData.on('error', function (e) {
            logger.error("Error: " + e);
        });
});

module.exports = router;
