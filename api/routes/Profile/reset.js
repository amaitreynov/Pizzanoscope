/**
 * Created by Antoine on 12/02/2016.
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require("mongoose"),
    User = mongoose.model("User"),
    _ = require('lodash'),
    logger = require('log4js').getLogger('controller.resetpassword'),
    securityUtil = require('../../Utils/securityUtils'),
    async = require('async'),
    emailUtils = require('../../Utils/emailUtils');

router.get('/:token', function (req, res) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user) {
        if (!user) {
            logger.error('Password reset token is invalid or has expired.');
            //todo flash info / notify the user with a message
            return res.redirect('/api/forgot/Password reset token is invalid or has expired.');
        }
        else {
            res.render('User/resetPassword', {title: 'Reset Password', resetPasswordToken: req.params.token});
        }
    });
});

router.post('/:token', function (req, res) {
    logger.info('Processing reset password.... process + mail info');
    logger.debug('newpassword:' + req.body.password);
    logger.debug('newpasswordConfirmation:' + req.body.passwordConfirmation);
    if (req.body.password != req.body.passwordConfirmation) {
        //todo flash info / notify the user with a message
        logger.error('Passwords aren\'t the same.');
        return res.redirect('back');
    }
    async.waterfall([
            function (done) {
                User.findOne({
                    resetPasswordToken: req.params.token,
                    resetPasswordExpires: {$gt: Date.now()}
                }, function (err, user) {
                    if (!user) {
                        logger.error('Password reset token is invalid or has expired.');
                        //todo flash info / notify the user with a message
                        return res.redirect('/api/login/Password reset token is invalid or has expired.');
                    }
                    else {
                        user.password = req.body.password;
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            if (err)
                                logger.error('Error while saving new password:' + err.message);
                            securityUtil.createToken(user, function (token, err) {
                                if (err)
                                    logger.error('Error while creating token:' + err.message);

                                securityUtil.createCookie(token, req, res, function (err) {
                                    if (err)
                                        logger.error('Error while creating cookie:' + err.message);
                                    done(err, user);
                                });
                            });
                        });
                    }
                });
            },
            function (user, done) {
                emailUtils.dispatchResetPasswordConfirmation(user, function (err) {
                    //todo flash info / notify the user with a message
                    logger.info('An e-mail has been sent to ' + user.email + ' to confirm password changed.');
                    done(err);
                });
            }
        ],
        function (err) {
            if (err) logger.error(err.message);
            res.redirect('/api/product/getAll');
        }
    );
});

module.exports = router;