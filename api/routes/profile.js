var express = require('express'),
    mongoose = require('mongoose'),
    User = require('../models/UserDB'),
    User = mongoose.model('User'),
    Class = mongoose.model('Class'),
    bcrypt = require("bcryptjs"),
    _ = require('lodash'),
    logger = require('log4js').getLogger('controller.profile'),
    async = require('async'),
    Cookies = require("cookies");
var securityUtil = require("../Utils/securityUtils.js");
var config = require('../config.json');
var jwt = require('jsonwebtoken');
var router = express.Router();

// TODO: Check why it throw an error (500)
router.get('/', function (req, res) {
    var token = new Cookies(req, res).get('access_token');
    var user = jwt.decode(token, config.secret);
    logger.debug(user._doc);
    res.render('Profile/profile', {user: user._doc});
});

router.get('/:value', function (req, res) {
    var token = new Cookies(req, res).get('access_token');
    var user = jwt.decode(token, config.secret);
    logger.debug(user._doc);
    res.render('Profile/profile', {user: user._doc, profileUpdated: req.params.value});
});

router.get('/:value', function (req, res) {
    var token = new Cookies(req, res).get('access_token');
    var user = jwt.decode(token, config.secret);
    res.render('User/profile', {user: user._doc, profileUpdated: req.params.value});
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

            logger.debug(user);
            securityUtil.createToken(user, next, function (token, err) {
                if (err)
                    logger.info(err.message);

                securityUtil.createCookie(token, req, res, next, function (err) {
                    if (err)
                        logger.info(err.message);

                    res.redirect('/api/profile/Le profil a été mis à jour !');
                });
            });
        });
});

router.post('/updateProfilePassword', function (req, res, next) {

    if (_.isEmpty(req.body.password)) {
        User.findOne({_id: req.body.userId}, function (err) {
            if (err) logger.error(err.message);

            res.redirect('/api/profile/');
        });
    }
    else {
        if (req.body.password == req.body.checkPass) {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    return next(err);
                }
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    if (err) {
                        return next(err);
                    }
                    if (!_.isEmpty(req.body.password)) {
                        User.findOneAndUpdate(
                            {_id: req.body.userIdPass},
                            {$set: {password: hash}},
                            {new: true},
                            function (err, user) {
                                if (err)
                                    logger.error(err.message);

                                logger.debug(user);
                                securityUtil.createToken(user, next, function (token, err) {
                                    if (err)
                                        logger.info(err.message);

                                    securityUtil.createCookie(token, req, res, next, function (err) {
                                        if (err)
                                            logger.info(err.message);

                                        res.redirect('/api/profile/updateProfile/Le mot de passe a été mis à jour !');
                                    });
                                });
                            });
                    }
                });
            });
        }
        else {
            res.redirect('/api/profile/Les deux mots de passe ne sont pas identiques !');
        }
    }
});

router.get('/setup', function (req, res) {
    //res.render('setup', { title: 'Setup Page' });
    // create a sample user
    var class1 = new Class({
        name: 'Expert 1',
        school: 'Ingesup Lyon',
        created_on: Date.now(),
        updated_at: Date.now()
    });
    var nick = new User({
        firstname: 'Thomas',
        lastname: 'Doret',
        username: 'admin',
        email: 'thomas.doret33@gmail.com',
        password: 'admin',
        avatar: 'yoloAvatar',
        address: 'No address',
        phoneNumber: '0684350295',
        admin: true,
        class: class1,
        created_on: Date.now(),
        updated_at: Date.now()
    }).save(function (err) {
        if (err) logger.info(err);

        logger.info('Profile saved successfully');
        res.json({success: true});
    });
});

module.exports = router;
