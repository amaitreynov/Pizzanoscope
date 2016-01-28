var https = require('https');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var paypal = require('paypal-rest-sdk');
var Cookies = require("cookies");
var UtilsOrder = require('../Utils/orderUtils');
var utils = require("../Utils/utils.js");
var config = require('../config.json');
var jwt = require('jsonwebtoken');


var Order = mongoose.model('Order');
var Pizza = mongoose.model('Pizza');
var User = mongoose.model('User');
var Class = mongoose.model('Class');

/* GET home page. */
router.get('/getAll', function (req, res) {
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
                console.log('ending http request');
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
            console.error("Error: " + e);
        });
});


router.get('/getAll', function(req, res) {
    Pizza.
        find().
        exec(function(err, orders){
            res.json(orders);
        });
});

router.get('/del/:value1', function(req, res) {
        var UpdateOrderToDelete = JSON.parse(new Cookies(req, res).get("order"));

        if(UpdateOrderToDelete.pizzaList.length == 1)
            res.redirect('/api/orders/cleanOrder/'+UpdateOrderToDelete._id);
        else
        {
            // TODO: value1 seems to be unused, check var
            Pizza.findOne({_id: req.params.value1}, function (err, returnedPizza) {
                if (err) console.log(err.message);

                UpdateOrderToDelete = UtilsOrder.deletePizzaIntoOrder(returnedPizza, UpdateOrderToDelete, function (orderToUpdate) {
                    //console.log("Order to push into cookie:" + JSON.stringify(orderToUpdate._id));
                    Pizza.remove({_id: returnedPizza._id}, function (err) {
                        if (err) console.log(err.message);
                        new Cookies(req, res).set('order', JSON.stringify(orderToUpdate), {
                            httpOnly: true,
                            secure: false      // for your dev environment => true for prod
                        });
                        // TODO: Exception may happen
                        res.redirect('/api/pizza/getAll');
                    });
                });
            });
        }
});

router.get('/cleanPizzaAll', function(req, res) {
        Pizza.remove(function (err) {
            if (err) console.log(err.message);
        });
        return res.status(200).json({working: true});

});

module.exports = router;
