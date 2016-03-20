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
var _ = require('lodash');

var Order = mongoose.model('Order');
var Pizza = mongoose.model('Pizza');
var User = mongoose.model('User');
var Class = mongoose.model('Class');

router.get('/del/:value1', function (req, res) {
    var UpdateOrderToDelete = req.cookies.OrderCookie;

    logger.info(UpdateOrderToDelete.pizzaList.length);
    if (UpdateOrderToDelete.pizzaList.length == 1)
        res.redirect('/api/basket/cleanBasket/' + UpdateOrderToDelete._id);
    else {
        // TODO: value1 seems to be unused, check var
        Pizza.findOne({_id: req.params.value1}, function (err, returnedPizza) {
            if (err) logger.error(err.message);

            UpdateOrderToDelete = UtilsOrder.deletePizzaIntoOrder(returnedPizza, UpdateOrderToDelete, function (orderToUpdate) {
                //logger.info("Order to push into cookie:" + JSON.stringify(orderToUpdate._id));
                Pizza.remove({_id: returnedPizza._id}, function (err) {
                    if (err) {
                        logger.error(err.message);
                    }
                    else {
                        new Cookies(req, res).set('order', JSON.stringify(orderToUpdate), {
                            httpOnly: true,
                            secure: false      // for your dev environment => true for prod
                        });
                        // TODO: Exception may happen
                        res.redirect('/api/product/getAll');
                    }
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

router.get('/cleanBasket/:value1', function (req, res) {
    logger.debug('value1 value:' + req.params.value1);
    Order.findOne({_id: req.params.value1}, function (err, order) {
        if (err) logger.error(err.message);

        if (order.pizzaList == undefined || order.pizzaList == null) {
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

    res.cookie('OrderCookie', null, { maxAge: 900000, httpOnly: true });
    res.redirect('/api/product/getAll');
});

router.get('/addPizza/name/:value1/price/:value2', function (req, res) {
    var orderCookie = req.cookies.OrderCookie;
    logger.debug('order cookie:' + orderCookie);
    /*if order is not created:
     -create a new pizza
     -create a new order with previously created pizza
     -replace cookie with created order
     */
    //order cookie isn't present
    if (!orderCookie || _.isNull(orderCookie)) {
        logger.info('----------------No order cookie present------------');
        var token = new Cookies(req, res).get('access_token');
        var user = jwt.decode(token, config.secret);

        //create new pizza
        UtilsOrder.createPizza(req, function (err, createdPizza) {
            if (err) {
                logger.error(err.message);
            }
            else {
                logger.debug('Created pizza: ' + JSON.stringify(createdPizza));

                //create new order with previously created pizza
                UtilsOrder.createOrder(user._doc, createdPizza._id, function (err, createdOrder) {
                    if (err)
                        throw (err.message);
                    //TODO handle with a message in view instead of status
                    if (_.isNull(createdOrder) || _.isEmpty(createdOrder)) {
                        res.set('Content-Type', 'application/json');
                        res.status(404).json(JSON.stringify({error: "Couldn't create order"}, null, 2));
                    }
                    else {
                        logger.debug('Created order: ' + JSON.stringify(createdOrder));
                        //cookies
                        res.cookie('OrderCookie',createdOrder, { maxAge: 900000, httpOnly: true });
                        console.log('cookie created successfully');

                        return res.redirect('/api/product/getAll');
                    }
                });
            }
        });
    }
    else {//order cookie is present
        logger.debug('----------------Order cookie present------------');
        /*if order already created:
         -create a new pizza
         -add pizza to order
         -replace cookie with updated order
         */
        //create new pizza
        UtilsOrder.createPizza(req, function (err, createdPizza) {
            if (err) {
                logger.error(err.message);
            }
            else {
                //add pizza in pizzaList of order from cookie
                // logger.info('order id ' + JSON.parse(new Cookies(req, res).get("order")));
                UtilsOrder.addPizzaInOrderPizzaList(createdPizza, orderCookie, function (err, updatedOrder) {
                    if (err){
                        logger.error(err.message);
                        throw err.message;
                    }
                    //TODO handle with a message in view instead of status
                    if (_.isNull(updatedOrder) || _.isEmpty(updatedOrder)) {
                        res.set('Content-Type', 'application/json');
                        res.status(404).json(JSON.stringify({error: "Couldn't update pizzaList"}, null, 2));
                    }
                    else {
                        logger.debug('Updated order returned: ' + JSON.stringify(updatedOrder));
                        res.cookie('OrderCookie',updatedOrder, { maxAge: 900000, httpOnly: true });

                        return res.redirect('/api/product/getAll');
                    }
                });
            }
        });
    }
});

module.exports = router;
