/**
 * Created by Antoine on 28/01/2016.
 */
"use strict";

var debug = require('debug')('app:utils:' + process.pid),
    uuid = require('uuid'),
    nJwt = require('nJwt'),
    config = require('../config.json'),
    _ = require("lodash"),
    mongoose = require('mongoose'),
    User = require('../models/UserDB'),
    User = mongoose.model('User'),
    securityUtil = require('./securityUtils'),
    orderUtils = require('./orderUtils'),
    UnauthorizedAccessError = require('../errors/UnauthorizedAccessError.js'),
    logger = require('log4js').getLogger('utils.user'),
    NotFoundError = require('../errors/NotFoundError.js');

module.exports.authenticate = function (req, res, next) {
    logger.info("Processing authenticate middleware");
    var registerError, message, route = null;
    if (_.isEmpty(req.body.email) || _.isEmpty(req.body.password)) {
        registerError = 'Missing email or password';
        return next(null, null, registerError);
        // res.redirect('/api/Login/Missing email or password');
        /*return next(new UnauthorizedAccessError("401", {
         message: 'Invalid username or password'
         }));*/
    }
    else {
        var email = req.body.email,
            password = req.body.password;

        User.findOne({
            email: email
        }, function (err, user) {
            if (err) {
                logger.error(err);
                return next(err, null, null);
                // res.redirect('/api/Login/Invalid email or password');
                /*return next(new UnauthorizedAccessError("401", {
                 message: 'Invalid email or password'
                 }));*/
            }
            if (!user) {
                message = 'Invalid email or password';
                return next(null, null, message);
                // res.redirect('/api/Login/Invalid email or password');
                /*return next(new UnauthorizedAccessError("401", {
                 message: 'Invalid email or password'
                 }));*/
            }

            if (user.verified == true) {
                user.comparePassword(password, function (err, isMatch) {
                    if (isMatch && !err) {
                        securityUtil.createToken(user, function (token, err) {
                            if (err)
                                logger.error(err.message);
                            else {
                                securityUtil.createCookie(token, req, res, function (err) {
                                    if (err)
                                        logger.error(err.message);
                                    else {
                                        route = '/api/product/getAll';
                                        return next(null, route, null);
                                        // res.redirect('/api/product/getAll');
                                    }
                                });
                            }
                        });

                    } else {
                        message = 'Invalid email or password';
                        return next(null, null, message);
                        // res.redirect('/api/Login/Invalid email or password');
                        /*return next(new UnauthorizedAccessError("401", {
                         message: 'Invalid email or password'
                         }));*/
                    }
                });
            }
            else {
                message = 'Invalid Account, Check your verification email';
                return next(null, null, message);
                // res.redirect('/api/Login/Invalid Account, Check your verification email');
                // return next(new UnauthorizedAccessError("401", {
                //     message: 'Invalid Account, Check your verification email'
                // }));
            }
        });
    }
};

module.exports.logout = function (req, res) {
    logger.info("Processing logout middleware");
    var orderToDelete = req.cookies.OrderCookie;

    //check if orderCookie is present
    if (!_.isEmpty(orderToDelete) && !_.isNull(orderToDelete)) {
        logger.debug('Order present, going to delete it');
        //then first delete the order and clear OrderCookie
        orderUtils.deleteOrder(orderToDelete, function (err) {
            if (err) {
                logger.error(err.message);
                throw err.message;
            }
            else {
                logger.debug('Order deleted, clearing cookie');
                res.clearCookie('OrderCookie');
                res.clearCookie('access_token');
                res.redirect('/api/login');
            }
        });
    }
    else {
        //clear access_token cookie and redirect to login page
        res.clearCookie('access_token');
        res.redirect('/api/login');
    }
};


