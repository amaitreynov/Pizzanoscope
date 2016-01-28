/**
 * Created by Ezehollar on 28/01/2016.
 */
var https = require('https');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var paypal = require('paypal-rest-sdk');
var Cookies = require("cookies");
var UtilsOrder = require('../Utils/orderUtils');
var logger = require('log4js').getLogger('controller.basket');
var utils = require("../Utils/securityUtils.js");
var config = require('../config.json');
var jwt = require('jsonwebtoken');


var Order = mongoose.model('Order');
var Pizza = mongoose.model('Pizza');
var User = mongoose.model('User');
var Class = mongoose.model('Class');



router.get('/del/:value1', function(req, res) {
    var UpdateOrderToDelete = JSON.parse(new Cookies(req, res).get("order"));

    logger.info(UpdateOrderToDelete.pizzaList.length);
    if(UpdateOrderToDelete.pizzaList.length == 1)
        res.redirect('/api/basket/cleanBasket/'+UpdateOrderToDelete._id);
    else
    {
        // TODO: value1 seems to be unused, check var
        Pizza.findOne({_id: req.params.value1}, function (err, returnedPizza) {
            if (err) logger.error(err.message);

            UpdateOrderToDelete = UtilsOrder.deletePizzaIntoOrder(returnedPizza, UpdateOrderToDelete, function (orderToUpdate) {
                //logger.info("Order to push into cookie:" + JSON.stringify(orderToUpdate._id));
                Pizza.remove({_id: returnedPizza._id}, function (err) {
                    if (err) logger.error(err.message);
                    new Cookies(req, res).set('order', JSON.stringify(orderToUpdate), {
                        httpOnly: true,
                        secure: false      // for your dev environment => true for prod
                    });
                    // TODO: Exception may happen
                    res.redirect('/api/product/getAll');
                });
            });
        });
    }
});

/*
router.get('/cleanBasket', function(req, res) {
    res.clearCookie('order');
    res.redirect('/api/product/getAll');
});*/

router.get('/cleanBasket/:value1', function(req, res) {
logger.debug('value1 value:'+req.params.value1);
    Order.findOne({_id: req.params.value1}, function(err,order) {
        if(err) logger.error(err.message);


        if(order.pizzaList == undefined || order.pizzaList == null) {
            order.pizzaList.forEach(function (item) {
                Pizza.remove({_id: item}, function (err) {
                    if (err) logger.error(err.message);
                });
            });

            Order.remove({_id: order._id}, function (err) {
                if (err) logger.error(err.message);
            });
        }
    });

    res.clearCookie('order');
    res.redirect('/api/product/getAll');
});

router.get('/addPizza/name/:value1/price/:value2', function(req, res) {
    var cookieJson = new Cookies(req, res).get("order");

    var firstPizza = new Pizza({
        name: req.params.value1,
        description: "Description Pizza",
        price: req.params.value2.substr(0,2),
        sizeType: "Large",
        doughType: "Classic"
    });

    var pizzaToAdd = new Pizza({
        name: req.params.value1,
        description: "Description Pizza",
        price: req.params.value2.substr(0,2),
        sizeType: "Large",
        doughType: "Classic"
    });

    if(cookieJson == undefined || cookieJson == null) {
        //logger.info('----------------createdOrder------------');
        var token = new Cookies(req, res).get('access_token');
        var user = jwt.decode(token, config.secret);

        firstPizza.save();
        //IF order is not create, create a new order
        var orderToInsert = new Order({
            "pizzaList": [firstPizza],
            "user": user,
            "state": "toBePaid",
            "paymentType": "PayPal"
        });

        orderToInsert.save();
        Order.findOne({_id: orderToInsert._id}).populate("user").exec(function(err) {
            if(err) logger.error(err.message); else logger.info('Populate User;');
        });
        Order.findOne({_id: orderToInsert._id}).populate("pizzaList").exec(function(err) {
            if(err) logger.error(err.message); else logger.info('Populate Pizza');
        });
        //logger.info('----------------createdOrder1------------');

        new Cookies(req, res).set('order', JSON.stringify(orderToInsert), {
            httpOnly: true,
            secure: false      // for your dev environment => true for prod
        });

        return res.redirect('/api/product/getAll');
    }
    else
    {
        //logger.info('------------insert Pizza----------------');
        //Ajout de la pizza
        pizzaToAdd.save();
        var UpdatedOrder = UtilsOrder.addPizzaIntoOrder(pizzaToAdd, JSON.parse(new Cookies(req, res).get("order")));
        Order.findOne({_id: UpdatedOrder._id}).populate("pizzaList").exec(function(err) {
            if(err) logger.error(err.message); else logger.info('Populate Pizza');
        });
        //logger.info('------------insert Pizza1----------------');
        new Cookies(req, res).set('order', JSON.stringify(UpdatedOrder), {
            httpOnly: true,
            secure: false      // for your dev environment => true for prod
        });
        return res.redirect('/api/product/getAll');
    }
});


module.exports = router;
