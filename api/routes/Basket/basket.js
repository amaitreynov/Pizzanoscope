/**
 * Created by Ezehollar on 28/01/2016.
 */
var https = require('https'),
    express = require('express'),
    mongoose = require('mongoose'),
    router = express.Router(),
    orderUtils = require('../../Utils/orderUtils'),
    logger = require('log4js').getLogger('controller.basket'),
    config = require('../../config.json'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash');

var Order = mongoose.model('Order');
var Pizza = mongoose.model('Pizza');
var User = mongoose.model('User');
var Class = mongoose.model('Class');

//TODO add session update
router.get('/delelePizza/:value1', function (req, res) {
    var orderToUpdate = req.cookies.OrderCookie;

    logger.debug('orderToUpdate.pizzaList : '+orderToUpdate.pizzaList);
    if (orderToUpdate.pizzaList.length == 1) {
        //only one pizza left, directly remove basket
        //delete the order and clear OrderCookie
        orderUtils.deleteOrder(orderToUpdate, function (err) {
            if (err) {
                logger.error(err.message);
                throw err.message;
            }
            else {
                logger.debug('order successfully deleted because it was the last pizza');
                res.clearCookie('OrderCookie');
                res.redirect('/api/product/getAll');
            }
        });
    }   
    else {//more than 1 pizza, deleting the specified pizza
        //get pizza
        Pizza.findOne({_id: req.params.value1}, function (err, returnedPizza) {
            if (err) {
                logger.error(err.message);
                throw err;
            }
            else {
                //update order's pizzaList attribute
                // logger.debug('returnedPizza ' + returnedPizza);
                orderUtils.removePizzaFromOrder(returnedPizza, orderToUpdate, function (err, updatedOrder) {
                    if (err) {
                        logger.error(err.message);
                        throw err;
                    }
                    else {
                        //finally remove the pizza from DB
                        // logger.debug("Order to push into cookie:" + JSON.stringify(updatedOrder));
                        Pizza.remove({_id: returnedPizza._id}, function (err) {
                            if (err) {
                                logger.error(err.message);
                                throw err;
                            }
                            else {
                                //update OrderCookie
                                // logger.debug('Reset OrderCookie :' + updatedOrder);
                                res.cookie('OrderCookie', updatedOrder, {maxAge: 900000, httpOnly: true});
                                res.redirect('/api/product/getAll');
                            }
                        });
                    }
                });
            }
        });
    }
});

//TODO add session update
router.get('/cleanBasket/', function (req, res) {
    var orderToDelete = req.cookies.OrderCookie;
    logger.debug('value:' + orderToDelete._id);

    Order.findOne({_id: orderToDelete._id}, function (err, order) {
        if (err) logger.error(err.message);

        // logger.debug('Order finded :'+order);
        Order.remove({_id: order._id}, function (err, orderRemoved) {
            if (err) logger.error(err.message);
            // logger.debug('Order Removed :' + orderRemoved);

            order.pizzaList.forEach(function (item) {
                Pizza.remove({_id: item}, function (err, pizzaRemoved) {
                    if (err) logger.error(err.message);
                    // logger.debug('Removed pizza :' + pizzaRemoved);
                    //TODO handle session update when removing an order from orderList
                    //=>removeOrderFromSession
                });
            });
            res.clearCookie('OrderCookie');
            res.redirect('/api/product/getAll');
        });
    });
});

//TODO add session update
router.get('/addPizza/name/:value1', function (req, res) {
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
        var token = req.cookies.access_token;
        //TODO optimization: check that user is defined (decoding went well)
        var user = jwt.decode(token, config.secret);

        //create new pizza
        orderUtils.createPizza(req, function (err, createdPizza) {
            if (err) {
                logger.error(err.message);
            }
            else {
                // logger.debug('Created pizza: ' + JSON.stringify(createdPizza));

                //create new order with previously created pizza
                orderUtils.createOrder(user._doc, createdPizza, function (err, createdOrder) {
                    if (err){
                        throw (err.message);
                    }
                    //TODO handle with a message in view instead of status
                    if (_.isNull(createdOrder) || _.isEmpty(createdOrder)) {
                        res.set('Content-Type', 'application/json');
                        res.status(404).json(JSON.stringify({error: "Couldn't create order"}, null, 2));
                    }
                    else {
                        // logger.debug('Created order: ' + JSON.stringify(createdOrder));
                        //cookies
                        res.cookie('OrderCookie', createdOrder, {maxAge: 900000, httpOnly: true});
                        // logger.debug('cookie created successfully');

                        //TODO refresh view only ? no need to redirect to the same page (no info exchanged with the products API)
                        res.redirect('/api/product/getAll');
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
        orderUtils.createPizza(req, function (err, createdPizza) {
            if (err) {
                logger.error(err.message);
            }
            else {
                //add pizza in pizzaList of order from cookie
                // logger.info('order id ' + JSON.parse(new Cookies(req, res).get("order")));
                orderUtils.addPizzaInOrderPizzaList(createdPizza, orderCookie, function (err, updatedOrder) {
                    if (err) {
                        logger.error(err.message);
                        throw err.message;
                    }
                    //TODO handle with a message in view instead of status
                    if (_.isNull(updatedOrder) || _.isEmpty(updatedOrder)) {
                        res.set('Content-Type', 'application/json');
                        res.status(404).json(JSON.stringify({error: "Couldn't update pizzaList"}, null, 2));
                    }
                    else {
                        // logger.debug('Updated order returned: ' + JSON.stringify(updatedOrder));
                        res.cookie('OrderCookie', updatedOrder, {maxAge: 900000, httpOnly: true});

                        //TODO refresh view only ? no need to redirect to the same page (no info exchanged with the products API)
                        res.redirect('/api/product/getAll');
                    }
                });
            }
        });
    }
});

module.exports = router;
