/**
 * Created by Antoine on 24/11/2015.
 */
"use strict";

var debug = require('debug')('app:utils:' + process.pid),
    uuid = require('uuid'),
    nJwt = require('nJwt'),
    jwt = require('jsonwebtoken'),
    logger = require('log4js').getLogger('utils.security'),
    config = require('../config.json'),
    _ = require("lodash"),
    mongoose = require('mongoose'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    url = require('url'),
    TOKEN_EXPIRATION = 60 * 60,
    TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60,
    UnauthorizedAccessError = require('../errors/UnauthorizedAccessError.js'),
    NotFoundError = require('../errors/NotFoundError.js');

module.exports.createToken = function createToken(user, callback) {
    if (_.isEmpty(user)) {
        callback(new Error('Profile data cannot be empty.'));
    }

    var token = jwt.sign(user, config.secret);
    callback(token);
};

module.exports.createCookie = function (jsonToken, req, res, callback) {

    if (_.isEmpty(jsonToken)) {
        callback(new Error('jsonToken cannot be empty.'));
    }
    else {
        //set a 1hour access_token cookie
        res.cookie('access_token', jsonToken, {maxAge: 3600000, httpOnly: true});

        callback();
    }
};

module.exports.handleToken = function (req, res, next) {
    var accessToken = req.cookies.access_token;
    // var accessToken = new Cookies(req, res).get('access_token');

    logger.info('-- EVALUATING CONNECTION --');
    //no connection is required on these links
    if (isDisconnectedLink(req.url)) {
        logger.info('-- NO CONNECTION REQUIRED -- Letting go...');
        next();
    } else { //connection required
        if (accessToken) {//token provided
            jwt.verify(accessToken, config.secret, function (err, decoded) {
                logger.info('-- CONNECTION REQUIRED -- TEST');
                if (err) {//invalid token
                    logger.error('Error while decoding token:' + err.message);
                    res.redirect('/');
                }
                else {//token verified and valid
                    logger.info('-- CONNECTION REQUIRED & ADMIN -- Evaluating admin permission');
                    //verifying if url attempted needs admin permission and permission is granted
                    if (isAdminRequiredLink(req.url) && decoded.admin == false) {
                        logger.info('-- CONNECTION REQUIRED & ADMIN -- Couldn\'t get admin permission');
                        res.redirect('/');
                    }
                    else {//no admin permission required to access this page
                        logger.info('-- CONNECTION REQUIRED -- No admin required, letting go...');
                        next();
                    }
                }
            });
        } else {
            //no token provided
            logger.info('-- CONNECTION REQUIRED -- No token provided, redirecting...');
            res.redirect('/');
        }
    }
};

function isDisconnectedLink(link) {
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
}

function isAdminRequiredLink(link) {
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
}

module.exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
module.exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;

logger.info("-- Security Utils loaded --");
