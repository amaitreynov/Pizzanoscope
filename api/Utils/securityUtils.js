/**
 * Created by Antoine on 24/11/2015.
 */
"use strict";

var debug = require('debug')('app:utils:' + process.pid),
    Cookies = require("cookies"),
    uuid = require('uuid'),
    nJwt = require('nJwt'),
    jwt = require('jsonwebtoken'),
    logger = require('log4js').getLogger('utils.security'),
    secretKey = uuid.v4(),
    config = require('../config.json'),
    _ = require("lodash"),
    mongoose = require('mongoose'),
    User = require('../models/UserDB'),
    User = mongoose.model('User'),
    url = require('url'),
    TOKEN_EXPIRATION = 60 * 60,
    TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60,
    UnauthorizedAccessError = require('../errors/UnauthorizedAccessError.js'),
    NotFoundError = require('../errors/NotFoundError.js');

module.exports.getPathParams = function getPathParams(req) {
    return url.parse(req.url).pathname.split('/').slice(1);
};

module.exports.createToken = function createToken(user) {
    if (_.isEmpty(user)) {
        return next(new Error('User data cannot be empty.'));
    }

    var token = jwt.sign(user, config.secret);
    return token;
};

module.exports.createCookie = function (jsonToken, req, res, next) {
    new Cookies(req, res).set('access_token', jsonToken, {
        httpOnly: true,
        secure: false
    });

    return next();
};

//module.exports.verify = function (req, res, next) {
//    logger.info("Verifying token");
//    var token = exports.fetch(req, res);
//    nJwt.verify(token, secretKey, function (err, token) {
//        if (err) {
//            req.user = undefined;
//            return next(new UnauthorizedAccessError("invalid_token"));
//        } else {
//            req.user = data;
//            logger.info("Token has been validated");
//            next();
//        }
//    });
//};

module.exports.isDisconnectedLink = function (link) {
    var dbl, dsl;
    for (var i = 0; i < config.disconnectedBeginLinks.length; i++) {
        dbl = config.disconnectedBeginLinks[i];
        if (link.indexOf(dbl) == 0)
            return true;
    }
    for (var i = 0; i < config.disconnectedStrictLinks.length; i++) {
        dsl = config.disconnectedStrictLinks[i];
        if (link == dsl || link == dsl + '/')
            return true;
    }
    return false;
};

module.exports.isAdminRequiredLink = function (link) {
    var arbl, arsl;
    for (var i = 0; i < config.adminRequiredBeginLinks.length; i++) {
        arbl = config.adminRequiredBeginLinks[i];
        if (link.indexOf(arbl) == 0)
            return true;
    }
    for (var i = 0; i < config.adminRequiredStrictLinks.length; i++) {
        arsl = config.adminRequiredStrictLinks[i];
        if (link == arsl || link == arsl + '/')
            return true;
    }
    return false;
};

module.exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
module.exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;

logger.info("-- Security Utils loaded --");
