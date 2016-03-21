/**
 * Created by Antoine on 24/11/2015.
 */
"use strict";

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose'),
    userUtil = require("../../Utils/userUtils.js"),
    logger = require('log4js').getLogger('controller.default'),
    debug = require('debug')('app:routes:default' + process.pid),
    _ = require("lodash"),
    path = require('path'),
    UnauthorizedAccessError = require(path.join(__dirname, "../..", "errors", "UnauthorizedAccessError.js"));
/*To remove orderCookie on logout*/
// var OrderDB = require('../../Models/OrderDB');
var Order = mongoose.model('Order');
var Pizza = mongoose.model('Pizza');
var User = mongoose.model('User');
var Class = mongoose.model('Class');


router.get(("/"), function (req, res) {
    res.render('Login/Login', {title: 'Login'});
});

router.get(("/Login"), function (req, res) {
    res.render('Login/Login', {title: 'Login'});
});

router.get(("/Login/:value"), function (req, res) {
    res.render('Login/Login', {title: 'Login', message: req.params.value});
});

router.get(("/Logout"), function (req, res) {
    var orderToDelete = req.cookies.OrderCookie;
    logger.debug('value:' + orderToDelete._id);

    Order.findOne({_id: orderToDelete._id}, function (err, order) {
        if (err) logger.error(err.message);

        logger.debug('Order finded :'+order);
        logger.debug('orderToRemove :' + order);
        Order.remove({_id: order._id}, function (err, orderRemoved) {
            if (err) logger.error(err.message);
            logger.debug('Order Removed :' + orderRemoved);

            order.pizzaList.forEach(function (item) {
                Pizza.remove({_id: item}, function (err, pizzaRemoved) {
                    if (err) logger.error(err.message);
                    logger.debug('Removed pizza :' + pizzaRemoved);
                });
            });
            res.clearCookie('access_token');
            res.clearCookie('OrderCookie');
            res.redirect('/');
        });
    });

});

router.post(("/Login"), function (req, res, next) {
    userUtil.authenticate(req, res, next);
});


router.unless = require("express-unless");

module.exports = router;