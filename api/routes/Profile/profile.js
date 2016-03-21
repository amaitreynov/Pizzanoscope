var express = require('express'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    logger = require('log4js').getLogger('controller.profile'),
    async = require('async'),
    jwt = require('jsonwebtoken'),
    moment = require('moment'),
    Cookies = require("cookies");

var securityUtil = require("../../Utils/securityUtils.js"),
    config = require('../../config.json');

var OrderDB = require('../../Models/OrderDB'),
    Order = mongoose.model('Order'),
    Pizza = mongoose.model('Pizza'),
    User = mongoose.model('User');

var router = express.Router();

router.get('/viewProfile', function (req, res) {
    var token = new Cookies(req, res).get('access_token');
    var user = jwt.decode(token, config.secret);
    logger.debug('UserFinded: ' + user._doc);
    res.render('Profile/profile', {user: user._doc});
});

router.get('/viewProfile/:value', function (req, res) {
    var token = new Cookies(req, res).get('access_token');
    var user = jwt.decode(token, config.secret);
    logger.debug('UserFinded: ' + user._doc);
    res.render('Profile/profile', {user: user._doc, profileUpdated: req.params.value});
});

router.get('/lastOrder/:value', function (req, res) {
    User.findOne({_id: req.params.value}).exec(function (err, userFinded) {
        if (err) logger.error(err.message);
        logger.debug('userFinded: ' + userFinded);

        Order.find({user: userFinded._id})//.find({user:req.params.value})
            .exec(function (err, orders) {
                if (err) logger.error(err.message);
                logger.debug('Orders:' + orders);
                
                //res.json(orders);
                Pizza.find().exec(function (err, pizzas) {
                    //res.json(pizzas);
                    res.render('Profile/profileUserOrder', {orders: orders, user: userFinded, pizzas: pizzas});
                });
            });
    });
    //res.render('Profile/profileUserOrder'/*, {user: user._doc, profileUpdated: req.params.value}*/);
});

router.post('/updateProfile', function (req, res, next) {
    User.findOneAndUpdate(
        {_id: req.body.userId},
        {
            $set: {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                email: req.body.email,
                address: req.body.address,
                phoneNumber: req.body.phoneNumber
            }
        },
        {new: true},
        function (err, user) {
            if (err)
                logger.error(err.message);

            // logger.debug('User from DB: '+user);
            securityUtil.createToken(user, function (token, err) {
                if (err)
                    logger.error(err.message);

                securityUtil.createCookie(token, req, res, function (err) {
                    if (err)
                        logger.error(err.message);

                    res.redirect('/api/profile/viewProfile/Le profil a été mis à jour !');
                });
            });
        });
});

router.post('/updateProfilePassword', function (req, res) {
    //all fields are filled
    if (!_.isEmpty(req.body.password) && !_.isEmpty(req.body.oldPassword) && !_.isEmpty(req.body.checkPass)) {
        User.findOne({_id: req.body.userIdPass}
            , function (err, userFinded) {
                if (err) {
                    logger.error(err.message);
                }
                if (_.isNull(userFinded) || _.isEmpty(userFinded)) {//no user found, pb in incoming params
                    logger.error({error: 'No user found with this password'});
                }
                else {
                    //check if old password is good
                    userFinded.comparePassword(req.body.oldPassword, function (err, isMatch) {
                        if (err)
                            logger.error('comparePasswordError: ' + err.message);

                        if (isMatch && !err) {//passwords are matching
                            if (req.body.password == req.body.checkPass) {
                                // logger.debug('UserToBeCrypt: '+userFinded);
                                userFinded.cryptPassword(req.body.password, function(newCryptedPassword, err) {
                                    if (err)
                                        logger.error('cryptPasswordError :' + err.message);

                                    // logger.debug('return cryptedPassword '+newCryptedPassword);
                                    userFinded.update(
                                        {$set: {password: newCryptedPassword}},
                                        {new: true},
                                        function (err) {
                                            if (err)
                                                logger.error(err.message);

                                            // logger.debug('UserUpdated: '+userFinded);
                                            securityUtil.createToken(userFinded, function (token, err) {
                                                if (err)
                                                    logger.info(err.message);

                                                securityUtil.createCookie(token, req, res, function (err) {
                                                    if (err)
                                                        logger.info(err.message);

                                                    res.redirect('/api/profile/viewProfile/Le mot de passe a été mis à jour !');
                                                });
                                            });
                                        });
                                });
                            }
                            else {
                                res.redirect('/api/profile/viewProfile/Les deux mot de passe ne sont pas identiques !');
                            }
                        }
                        else {
                            res.redirect('/api/profile/viewProfile/L\'ancien mot de passe n\'est pas le bon !');
                        }
                    });
                }
            });
    }
});

module.exports = router;
