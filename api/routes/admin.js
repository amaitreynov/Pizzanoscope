var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    Pizza = mongoose.model('Pizza'),
    Order = mongoose.model('Order');
var Cookies = require("cookies");
var utils = require("../Utils/securityUtils.js");
var config = require('../config.json'),
    logger = require('log4js').getLogger('controller.admin');
var jwt = require('jsonwebtoken');

/* GET admin home page. */
/* GET dashboard session page */
router.get('/', function (req, res) {
    Order.find().exec(function (err, orders) {
        if (err) console.log(err);

        User.find().exec(function (err, users) {
            if (err) console.log(err);

            Pizza.find().exec(function (err, pizzas) {
                //res.json(pizzas);
                res.render('Administration/back-dashboard-session', {orders: orders, users: users, pizzas: pizzas});
            });
        });
    });
});
/** USERS **/
/* GET admin users page. */
router.get('/users', function (req, res) {
    User.find().exec(function (err, usersRet) {
        if (err) throw err;

        var token = new Cookies(req, res).get('access_token');
        var user = jwt.decode(token, config.secret);
        logger.debug('Current User :'+user._doc);
        res.render('Administration/back-users', {users: usersRet, currentUser: user._doc});
    });
    //res.write('hello');
});

router.get('/users/deactivate/:value', function (req, res) {
    console.log(req.params.value);
    User.findOneAndUpdate({_id: req.params.value},{$set:{active: false}}).exec(function (err, user) {
        if (err) throw err;
        res.redirect('/api/admin/users');
    });
});

router.get('/users/activate/:value', function (req, res) {
    console.log(req.params.value);
    User.findOneAndUpdate({_id: req.params.value},{$set:{active: true}}).exec(function (err, user) {
        if (err) throw err;
        res.redirect('/api/admin/users');
    });
});

router.post('/users/updUser', function (req, res, next) {
    User.update(
        {_id: req.body.userId},
        {
            $set: {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                email: req.body.email,
                address: req.body.address,
                phoneNumber: req.body.phoneNumber,
                admin: req.body.isAdmin
            }
        },
        {multi: true}
    ).exec(function (err) {
        if (err)
            console.log(err.message);
        else {
            res.redirect('/api/admin/users');
            /*Profile.findOne({_id: req.body.userId}, function(err,user) {
             utils.createCookie(utils.createToken(user), '/api/users/Profile/Le profile a été mis à jour !', req, res);
             });*/
        }
    });
});

/** SESSION **/
/* GET live session  */
router.get('/session/live', function (req, res) {
    Order.find().exec(function (err, orders) {
        res.render('Administration/back-live-session', orders);
    });
    //res.write('hello');
});

/* GET all the history */
router.get('/session/history', function (req, res) {
    Order.find().exec(function (err, orders) {
        res.render('Administration/back-history-session', orders);
    });
    //res.write('hello');
});
/* GET the details of an old session */
router.get('/session/history/:sessionId', function (req, res) {
    Order.find().exec(function (err, orders) {
        res.render('Administration/back-history-session', orders);
    });
    //res.write('hello');
});




module.exports = router;
