/**
 * Created by Antoine on 24/11/2015.
 */
'use strict';

var express = require('express');
var router = express.Router();

var mongoose = require('mongoose'),
    userUtil = require('../../Utils/userUtils.js'),
    orderUtils = require('../../Utils/orderUtils'),
    logger = require('log4js').getLogger('controller.default'),
    debug = require('debug')('app:routes:default' + process.pid),
    path = require('path'),
    UnauthorizedAccessError = require(path.join(__dirname, '../..', 'errors', 'UnauthorizedAccessError.js'));

/*To remove orderCookie on logout*/
var Order = mongoose.model('Order'),
    Pizza = mongoose.model('Pizza'),
    User = mongoose.model('User'),
    Class = mongoose.model('Class');

router.get(('/'), function (req, res) {
    logger.info('Rendering login page');
    res.render('Login/Login', {title: 'Login'});
});

router.get(('/Login'), function (req, res) {
    logger.info('Rendering login page');
    res.render('Login/Login', {title: 'Login'});
});

router.get(('/Login/:value'), function (req, res) {
    logger.info('Rendering login page');
    res.render('Login/Login', {title: 'Login', message: req.params.value});
});

router.get(('/Logout'), function (req, res) {
    userUtil.logout(req, res);
});

router.post(('/Login'), function (req, res, next) {
    userUtil.authenticate(req, res, next);
});

router.unless = require('express-unless');
module.exports = router;