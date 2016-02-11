/**
 * Created by Antoine on 03/02/2016.
 */
var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User"),
    _ = require('lodash'),
    logger = require('log4js').getLogger('controller.validate'),
    Mailgun = require('mailgun-js'),
    emailUtils = require('../Utils/emailUtils');

//todo move part of this controller in a sub function in userUtils
router.get("/:mail", function (req, res) {
    logger.info('Verifying email....');
    logger.debug('email:' + req.params.mail);
    var registerErr = null;
    //logger.debug('token:'+securityUtils.getPathParams(req)[3]);

    User.findOne({email: req.params.mail}, function (err, user) {
        if (err) throw err;
        else {
            //un user existe avec cet email
            if (user) {
                var mailgun = new Mailgun({
                    apiKey: 'key-7d3e1a0c62fc2084098e00ff32f0c06d',
                    domain: 'sandboxfc7fd911df6643e88fd945a63667ccb9.mailgun.org'
                });

                var members = [
                    {
                        address: req.params.mail
                    }
                ];
                //For the sake of this tutorial you need to create a mailing list on Mailgun.com/cp/lists and put its address below
                mailgun.lists('accountvalidation@sandboxfc7fd911df6643e88fd945a63667ccb9.mailgun.org').members().add({
                    members: members,
                    subscribed: true
                }, function (err, body) {
                    logger.debug('Response from Mailgun:' + JSON.stringify(body));
                    if (err) {
                        logger.error(err);
                        throw err;
                    }
                    else {
                        User.findOneAndUpdate(
                            {
                                email: req.params.mail
                            },
                            {
                                $set: {
                                    verified: true
                                }
                            },
                            {new: true}, //means we want the DB to return the updated document instead of the old one
                            function (err, updatedUser) {
                                if (err)throw err;
                                else {
                                    logger.debug("Updated user object: \n" + updatedUser);
                                    //req.flash('emailValidation', 'Merci, votre email est bien vérifié !');
                                    res.redirect('/api/profile/Merci, votre email est bien vérifié !');
                                }
                            });
                    }
                });
            }
            //user avec cet email inexistant
            else {
                registerErr = "Il n'y a pas d'utilisateur avec cet email !";
                logger.error(registerErr);
                res.render('User/verifyEmailFail', {
                    registerErr: registerErr
                });
            }
        }
    });
});

module.exports = router;