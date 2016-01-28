var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'),
    UserDB = require('../models/UserDB'),
    User = mongoose.model('User'),
    Pizza = mongoose.model('Pizza'),
    Order = mongoose.model('Order');
var Cookies = require("cookies");
var utils = require("../Utils/securityUtils.js");
var config = require('../config.json');
var jwt = require('jsonwebtoken');

/* GET admin home page. */
router.get('/', function (req, res) {
        res.redirect('/api/admin/orders');
});

/* GET admin users page. */
router.get('/users', function (req, res) {
    User.
    find().
    exec(function (err, usersRet) {
        if (err) throw err;

        var token = new Cookies(req, res).get('access_token');
        var user = jwt.decode(token, config.secret);
        console.log(usersRet);
        res.render('Administration/back-users', {users: usersRet, currentUser: user});
    });
    //res.write('hello');
});

/* GET admin users page. */
router.get('/users/delete/:value', function (req, res) {
    console.log(req.params.value);
    User.
    remove({_id: req.params.value}).
    exec(function (err, user) {
        if (err) throw err;
        res.redirect('/api/admin/users');
    });
});

router.post('/users/updUser', function(req, res, next) {
    User.
        update(
        {_id: req.body.userId},
        {$set: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            admin: req.body.isAdmin
        }},
        {multi: true}
    ).exec(function(err) {
            if (err)
                console.log(err.message);
            else
            {
                res.redirect('/api/admin/users');
                /*User.findOne({_id: req.body.userId}, function(err,user) {
                    utils.createCookie(utils.createToken(user), '/api/users/Profile/Le profile a été mis à jour !', req, res);
                });*/
            }

        });

});

/* GET admin orders page. */
//TODO get the pizzas and user related to the order
//create an object and push it in, then send all this to swig
//eviter de recup la base entière :)
router.get('/orders', function (req, res) {
    Order.
    find().
    exec(function (err, orders) {
        if (err) console.log(err);

        User.
            find().exec(function(err, users){
            if (err) console.log(err);

            Pizza.find().exec(function(err, pizzas){
                //res.json(pizzas);
               res.render('Administration/back-orders', {orders: orders, users: users, pizzas: pizzas});
            });
        });
    });
});

    /* GET admin orders page. */
    router.post('/orders/:orderId', function (req, res) {
        Order.
        find().
        exec(function (err, orders) {
            res.render('Administration/back-orders', orders);
        });
        //res.write('hello');
    });

    module.exports = router;
