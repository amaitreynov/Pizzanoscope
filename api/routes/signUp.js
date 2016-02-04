var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User"),
    _ = require('lodash'),
    logger = require('log4js').getLogger('controller.signup'),
    emailUtils = require('../Utils/emailUtils');
var Class = mongoose.model("Class");

router.get(("/"), function (req, res) {
    res.render('SignUp/signUp', {title: 'SignUpPage'});
});

router.post('/addUser', function (req, res) {
    var registerErr = null;
    var m_mail = req.body.mail.toString();

    if (req.body.checkmail == m_mail) {
        if (req.body.checkpass == req.body.pass) {
            if (m_mail.indexOf("@ynov.com") > -1) {
                User.find({
                    email: m_mail,
                    username: req.body.username
                }).exec(function (err, result) {
                    if (_.isEmpty(result) || _.isNull(result)) {
                        var user = new User({
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            username: req.body.username,
                            email: m_mail,
                            password: req.body.pass,
                            avatar: "https://cdn1.iconfinder.com/data/icons/ninja-things-1/1772/ninja-simple-512.png",
                            address: req.body.address,
                            phoneNumber: req.body.phone,
                            admin: false,
                            class: req.body.class,
                            created_on: Date.now(),
                            updated_at: Date.now()
                        });
                        user.save(function (err, user) {
                            if (err)
                                logger.error(err);
                            else {
                                logger.info('User saved successfully:' + user);
                                //send email
                                emailUtils.dispatchAccountValidationLink(user, function (err, user) {
                                    if (!err) {
                                        res.render('SignUp/signUpSuccess', {
                                            registerSuccess: "Merci, vous êtes bien inscrit !\n" +
                                            "Un email contenant un lien de confirmation de votre adresse mail\n" +
                                            "vous a été envoyé à l'adresse mail " + user.email + "\n Merci de confirmer votre email :)",
                                            email: m_mail,
                                            pass: req.body.pass
                                        });
                                    }
                                    else {
                                        logger.error('Error sending mail:' + JSON.stringify(err));
                                        res.render('SignUp/signUp', {
                                            registerErr: JSON.stringify(err),
                                            firstname: req.body.firstname,
                                            lastname: req.body.lastname,
                                            username: req.body.username,
                                            email: m_mail,
                                            checkMail: req.body.checkmail,
                                            password: req.body.pass,
                                            address: req.body.address,
                                            phoneNumber: req.body.phone
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else {
                        registerErr = "L'utilisateur existe déjà !";
                        logger.error(registerErr);
                        res.render('SignUp/signUp', {
                            registerErr: registerErr, firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            username: req.body.username,
                            email: m_mail,
                            checkMail: req.body.checkmail,
                            password: req.body.pass,
                            address: req.body.address,
                            phoneNumber: req.body.phone
                        });

                    }
                });
            }
            else {
                registerErr = "Votre adresse mail n'est pas une adresse Ynov !";
                logger.error(registerErr);
                res.render('SignUp/signUp', {
                    registerErr: registerErr, firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    username: req.body.username,
                    email: m_mail,
                    checkMail: req.body.checkmail,
                    password: req.body.pass,
                    address: req.body.address,
                    phoneNumber: req.body.phone
                });
            }
        }
        else {
            registerErr = "Les deux mots de passe ne sont pas identiques !";
            logger.error(registerErr);
            res.render('SignUp/signUp', {
                registerErr: registerErr, firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                email: m_mail,
                checkMail: req.body.checkmail,
                password: req.body.pass,
                address: req.body.address,
                phoneNumber: req.body.phone
            });
        }
    }
    else {
        registerErr = "Les deux adresses mail ne sont pas identiques !";
        logger.error(registerErr);
        res.render('SignUp/signUp', {
            registerErr: registerErr, firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: m_mail,
            checkMail: req.body.checkmail,
            password: req.body.pass,
            address: req.body.address,
            phoneNumber: req.body.phone
        });
    }

});


module.exports = router;