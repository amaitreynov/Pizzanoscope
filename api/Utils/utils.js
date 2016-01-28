/**
 * Created by Antoine on 24/11/2015.
 */
"use strict";

var debug = require('debug')('app:utils:' + process.pid),
    Cookies = require("cookies"),
    uuid = require('uuid'),
    nJwt = require('nJwt'),
    jwt = require('jsonwebtoken'),
    secretKey = uuid.v4(),
    config = require('../config.json'),
    _ = require("lodash"),
    mongoose = require('mongoose'),
    User = require('../models/UserDB'),
    User = mongoose.model('User'),

    TOKEN_EXPIRATION = 60 * 60,
    TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60,
    UnauthorizedAccessError = require('../errors/UnauthorizedAccessError.js'),
    NotFoundError = require('../errors/NotFoundError.js');

module.exports.createToken = function createToken (user) {

    if (_.isEmpty(user)) {
        return next(new Error('User data cannot be empty.'));
    }

    var token = jwt.sign(user, config.secret);
    return token;
};

module.exports.createCookie = function(jsonToken, url, req, res) {

    new Cookies(req, res).set('access_token', jsonToken, {
        httpOnly: true,
        secure: false
    });

    if(url == null)
        res.redirect('/api/pizza/getAll');
    else
        res.redirect(url);

};

module.exports.verify = function (req, res, next) {
    console.log("Verifying token");
    var token = exports.fetch(req, res);
    nJwt.verify(token, secretKey, function (err, token) {
        if (err) {
            req.user = undefined;
            return next(new UnauthorizedAccessError("invalid_token"));
        } else {
            req.user = data;
            console.log("Token has been validated");
            next();
        }
    });
};

module.exports.isDisconnectedLink = function(link){
    var dbl, dsl;
    for(var i =0; i < config.disconnectedBeginLinks.length; i++){
        dbl = config.disconnectedBeginLinks[i];
        if(link.indexOf(dbl) == 0)
            return true;
    }
    for(var i =0; i < config.disconnectedStrictLinks.length; i++){
        dsl = config.disconnectedStrictLinks[i];
        if(link == dsl ||link == dsl + '/')
            return true;
    }
    return false;
}

module.exports.isAdminRequiredLink = function(link){
    var arbl, arsl;
    for(var i =0; i < config.adminRequiredBeginLinks.length; i++){
        arbl = config.adminRequiredBeginLinks[i];
        if(link.indexOf(arbl) == 0)
            return true;
    }
    for(var i =0; i < config.adminRequiredStrictLinks.length; i++){
        arsl = config.adminRequiredStrictLinks[i];
        if(link == arsl ||link == arsl + '/')
            return true;
    }
    return false;
}


module.exports.authenticate = function (req, res, next) {

    console.log("Processing authenticate middleware");

    var username = req.body.username,
        password = req.body.password;

    if (_.isEmpty(username) || _.isEmpty(password)) {
        return next(new UnauthorizedAccessError("401", {
            message: 'Invalid username or password'
        }));
    }

    User.findOne({
        username: username
    }, function (err, user) {
        if (err || !user) {
            console.log(err);
            return next(new UnauthorizedAccessError("401", {
                message: 'Invalid username or password'
            }));
        }

        user.comparePassword(password, function (err, isMatch) {
            if (isMatch && !err) {

                /*new Cookies(req, res).set('user', JSON.stringify(user), {
                    httpOnly: true,
                    secure: false      // for your dev environment => true for prod
                });*/

                exports.createCookie(exports.createToken(user), null, req, res);
            } else {
                return next(new UnauthorizedAccessError("401", {
                    message: 'Invalid username or password'
                }));
            }
        });
    });

};


module.exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
module.exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;

console.log("-- Utils loaded --");