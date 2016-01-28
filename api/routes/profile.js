var express = require('express'),
    mongoose = require('mongoose'),
    User = require('../models/UserDB'),
    User = mongoose.model('User'),
    Class = mongoose.model('Class'),
    bcrypt = require("bcryptjs"),
    Cookies = require("cookies");
var utils = require("../Utils/securityUtils.js");
var config = require('../config.json');
var jwt = require('jsonwebtoken');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  User.
      find().
      exec(function(err, users){
        res.json(users);
      });
});

// TODO: Check why it throw an error (500)
router.get('/profile', function(req, res) {
    var token = new Cookies(req, res).get('access_token');
    var user = jwt.decode(token, config.secret);
    res.render('User/profile', { user : user });
});

router.get('/Profile/:value', function(req, res) {
    var token = new Cookies(req, res).get('access_token');
    var user = jwt.decode(token, config.secret);
    res.render('User/profile', { user : user ,profileUpdated : req.params.value});
});

/* DELETE user */
router.get('/delete/:value', function(req, res){
    utils.middleware(true, req, res, function() {
        console.log(req.params.value);
        User.
            remove({_id: req.params.value}).
            exec(function(err, user){
                res.json(user);
            });
    });
});

router.post('/updUser', function(req, res, next) {
    User.
         update(
        {_id: req.body.userId},
        {$set: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber
        }},
        {multi: true}
        ).exec(function(err) {
            if (err)
                console.log(err.message);
            else
            {

                User.findOne({_id: req.body.userId}, function(err,user) {
                    utils.createCookie(utils.createToken(user), '/api/users/Profile/Le profile a été mis à jour !', req, res);
                });
            }

        });

});

router.post('/updUserPass', function(req, res, next) {

    if(req.body.password == '')
    {
        User.findOne({_id: req.body.userId}, function(err) {
            if(err) console.log(err.message);

            res.redirect('/api/users/profile');
        });
    }
    else
    {
        if(req.body.password == req.body.checkPass)
        {
            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    return next(err);
                }
                bcrypt.hash(req.body.password, salt, function (err, hash) {
                    if (err) {
                        return next(err);
                    }
                    if (req.body.password != '')
                    {
                        User.
                            update(
                            {_id: req.body.userIdPass},
                            {$set: {password: hash}}
                        ).exec(function (err) {
                                if(err) console.log(err.message);

                                User.findOne({_id: req.body.userIdPass}, function(err,user) {
                                    if(err) console.log(err.message);

                                    utils.createCookie(utils.createToken(user), '/api/users/Profile/Le mot de passe a été mis à jour !', req, res);
                                });
                            });
                    }
                });
            });
        }
        else
        {
            res.redirect('/api/users/Profile/Les deux mots de passe ne sont pas identiques !');
        }


    }

});

router.get('/setup', function(req, res) {
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
    }).save(function(err) {
            if (err) console.log(err);

            console.log('User saved successfully');
            res.json({ success: true });
        });
});

module.exports = router;
