/**
 * Created by Antoine on 24/11/2015.
 */
"use strict";

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose'),
    userUtil = require("../Utils/userUtils.js"),
    debug = require('debug')('app:routes:default' + process.pid),
    _ = require("lodash"),
    path = require('path'),
    UnauthorizedAccessError = require(path.join(__dirname, "..", "errors", "UnauthorizedAccessError.js")),
    User = mongoose.model('User');


    router.get(("/"), function (req, res) {
        res.render('SignUpLogin/login', {title: 'Login'});
    });

    router.get(("/login"), function (req, res) {
        res.render('SignUpLogin/login', {title: 'Login'});
    });

    router.get(("/logout"), function (req, res) {
        res.clearCookie('access_token');
        res.clearCookie('order');
        res.redirect('/');
    });

    router.post(("/login"), function (req, res, next) {
        userUtil.authenticate(req, res, next);
    });


    router.unless = require("express-unless");

module.exports = router;