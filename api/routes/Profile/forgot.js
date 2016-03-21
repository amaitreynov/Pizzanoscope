/**
 * Created by Antoine on 12/02/2016.
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require("mongoose"),
    User = mongoose.model("User"),
    _ = require('lodash'),
    logger = require('log4js').getLogger('controller.forgotpassword'),
    async = require('async'),
    crypto = require('crypto'),
    emailUtils = require('../../Utils/emailUtils');

router.get('/', function (req, res) {
    res.render('login/forgotPassword', {title: 'Mot de passe oublié'});
});

router.get('/:value', function (req, res) {
    res.render('login/forgotPassword', {title: 'Mot de passe oublié', message:req.params.value});
});

router.post('/', function (req, res) {
    var emailInput;
    if (!_.isNull(req.body.AdminRecoverEmail))
        emailInput =  req.body.AdminRecoverEmail;
    else
        emailInput = req.body.email;

    var registerErr = null;
    logger.info('Processing sending password recovery mail...');
    //res.redirect('/api/login/API non implementee');
    //res.render('SignUp/signUp', {title: 'S\'inscrire'});
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({email: emailInput}, function (err, user) {
                if (!user) {
                    //todo flash info / notify the user with a message
                    registerErr = 'No account with that email address exists.';
                    logger.error(registerErr);
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            emailUtils.dispatchResetPasswordLink(user, token, function (err) {
                //todo flash info / notify the user with a message
                logger.info('An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) logger.error(err.message);

        if (!_.isNull(req.body.AdminRecoverEmail))
            res.redirect('/api/admin/users');
        else
            res.redirect('/forgot');


    });
});

module.exports = router;

