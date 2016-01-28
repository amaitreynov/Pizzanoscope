var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Class = mongoose.model("Class");

router.get('/' , function(req, res) {
    res.redirect('/api/login');
});

router.post('/addUser' , function(req, res)
{
    var registerErr = null;
    var m_mail = req.body.mail.toString();

    if(req.body.checkmail == m_mail)
    {
        if(req.body.checkpass == req.body.pass) {
            if (m_mail.indexOf("@ynov.com") > -1) {
                User.find({
                    email: m_mail,
                    username: req.body.username
                }).exec(function (err, result) {
                    if (result == "") {
                        var class1 = new Class({
                            name: 'Bidon',
                            school: 'Bidon',
                            created_on: Date.now(),
                            updated_at: Date.now()
                        });
                        var user = new User(
                            {
                                firstname: req.body.firstname,
                                lastname: req.body.lastname,
                                username: req.body.username,
                                email: m_mail,
                                password: req.body.pass,
                                avatar: "https://cdn1.iconfinder.com/data/icons/ninja-things-1/1772/ninja-simple-512.png",
                                address: req.body.address,
                                phoneNumber: req.body.phone,
                                admin: false,
                                class: class1,
                                created_on: Date.now(),
                                updated_at: Date.now(),
                            }
                        );
                        user.save(function (err) {
                            if (err)
                                console.log(err);
                            else
                            {
                                console.log('User saved successfully');
                                res.render('SignUpLogin/signUpSuccess', {registerSuccess: "Merci, vous êtes bien inscrit !", username: req.body.username, pass: req.body.pass });
                            }
                        });
                    }
                    else
                    {
                        registerErr = "L'utilisateur existe déjà !";
                        console.log(registerErr);
                        res.render('SignUpLogin/signUp', {registerErr: registerErr, firstname: req.body.firstname,
                                                                        lastname: req.body.lastname,
                                                                        username: req.body.username,
                                                                        email: m_mail,
                                                                        checkMail : req.body.checkmail,
                                                                        password: req.body.pass,
                                                                        address: req.body.address,
                                                                        phoneNumber: req.body.phone});

                    }
                });
            }
            else
            {
                registerErr = "Votre adresse mail n'est pas une adresse Ynov !";
                console.log(registerErr);
                res.render('SignUpLogin/signUp', {registerErr: registerErr, firstname: req.body.firstname,
                                                                lastname: req.body.lastname,
                                                                username: req.body.username,
                                                                email: m_mail,
                                                                checkMail : req.body.checkmail,
                                                                password: req.body.pass,
                                                                address: req.body.address,
                                                                phoneNumber: req.body.phone});
            }
        }
        else
        {
            registerErr = "Les deux mots de passe ne sont pas identiques !";
            console.log(registerErr);
            res.render('SignUpLogin/signUp', {registerErr: registerErr, firstname: req.body.firstname,
                                                            lastname: req.body.lastname,
                                                            username: req.body.username,
                                                            email: m_mail,
                                                            checkMail : req.body.checkmail,
                                                            password: req.body.pass,
                                                            address: req.body.address,
                                                            phoneNumber: req.body.phone});
        }
    }
    else
    {
        registerErr = "Les deux adresses mails ne sont pas identiques !";
        console.log(registerErr);
        res.render('SignUpLogin/signUp', {registerErr: registerErr, firstname: req.body.firstname,
                                                        lastname: req.body.lastname,
                                                        username: req.body.username,
                                                        email: m_mail,
                                                        checkMail : req.body.checkmail,
                                                        password: req.body.pass,
                                                        address: req.body.address,
                                                        phoneNumber: req.body.phone});
    }

});


module.exports = router;