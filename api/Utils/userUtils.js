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
    UnauthorizedAccessError = require('../errors/UnauthorizedAccessError.js'),
    logger = require('log4js').getLogger('utils.user'),
    NotFoundError = require('../errors/NotFoundError.js');

module.exports.authenticate = function (req, res, next) {

    logger.info("Processing authenticate middleware");

    var email = req.body.email,
        password = req.body.password;

    if (_.isEmpty(email) || _.isEmpty(password)) {
        return next(new UnauthorizedAccessError("401", {
            message: 'Invalid username or password'
        }));
    }

    User.findOne({
        email: email
    }, function (err, user) {
        if (err || !user) {
            logger.error(err);
            return next(new UnauthorizedAccessError("401", {
                message: 'Invalid email or password'
            }));
        }

        user.comparePassword(password, function (err, isMatch) {
            if (isMatch && !err) {

                /*new Cookies(req, res).set('user', JSON.stringify(user), {
                 httpOnly: true,
                 secure: false      // for your dev environment => true for prod
                 });*/

                securityUtil.createCookie(securityUtil.createToken(user), null, req, res, next);
                res.redirect('/api/product/getAll');

            } else {
                return next(new UnauthorizedAccessError("401", {
                    message: 'Invalid email or password'
                }));
            }
        });
    });

};

