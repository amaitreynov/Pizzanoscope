var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'),
    SessionDB = require('../../Models/SessionDB'),
    Session = mongoose.model('Session'),
// UserDB = require('../../Models/UserDB'),
    User = mongoose.model('User'),
    Pizza = mongoose.model('Pizza'),
    Order = mongoose.model('Order');
var Cookies = require("cookies");
var _ = require('lodash');
var utils = require("../../Utils/securityUtils.js");
var sessionUtils = require("../../Utils/sessionUtils.js");
var config = require('../../config.json'),
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
        logger.debug('Current User :' + user._doc);
        res.render('Administration/back-users', {users: usersRet, currentUser: user._doc});
    });
    //res.write('hello');
});

router.get('/users/deactivate/:value', function (req, res) {
    console.log(req.params.value);
    User.findOneAndUpdate({_id: req.params.value}, {$set: {active: false}}).exec(function (err, user) {
        if (err) throw err;
        res.redirect('/api/admin/users');
    });
});

router.get('/users/activate/:value', function (req, res) {
    console.log(req.params.value);
    User.findOneAndUpdate({_id: req.params.value}, {$set: {active: true}}).exec(function (err, user) {
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
/*
 - Action: Creates a new session object in DB
 - Returns: callback with the created session 
 error if it's the case or if object from db is null/empty
 */
router.post('/session/new', function (req, res) {
    sessionUtils.createSession(req, function (err, sessionCreated) {
        if (err) {
            logger.error('Error while creating session:' + err);
        }
        if (_.isNull(sessionCreated) || _.isEmpty(sessionCreated)) {

            res.render('Administration/back-live-session', {liveSession: null});
        } else {
            logger.debug('displaying retrieved live session :' + sessionCreated);
            res.render('Administration/back-live-session', {liveSession: sessionCreated});
        }
    });
});

/* GET live session  */
router.get('/session/live', function (req, res) {
    sessionUtils.getCurrentSession(function (err, session) {
        if (err) {
            logger.error('Error while getting current session:' + err);
        }
        if (_.isNull(session) || _.isEmpty(session)) {
            res.render('Administration/back-live-session', {liveSession: null});
        } else {
            Order.find({})//.find({user:req.params.value})
                .populate('user')
                .exec(function (err, orders) {
                    if (err) logger.error(err.message);
                    //logger.debug('Orders:' + orders);

                    //res.json(orders);
                    Pizza.find().exec(function (err, pizzas) {
                        //res.json(pizzas);
                        logger.debug('displaying retrieved live session :' + session);
                        res.render('Administration/back-live-session', {
                            liveSession: session,
                            orders: orders,
                            pizzas: pizzas
                        });
                    });
                });

        }
    });
});

router.get('/session/close', function (req, res) {
    sessionUtils.getCurrentSession(function (err, session) {
        if (err) {
            logger.error('Error while getting current session:' + err);
        }

        Session.findOneAndUpdate({_id: session._id},
            {
                $set: {
                    endHour: Date.now(),
                    active: false
                }
            },
            {new: true},
            function (session, err) {
                res.redirect('/api/admin/session/history');
            });
    });
});

/* GET all the history */
router.get('/session/history', function (req, res) {
    Session.find().exec(function (err, sessions) {
        logger.info(sessions);
        res.render('Administration/back-history-session', {sessions: sessions});
    });
    //res.write('hello');
});

/* GET the details of an old session */
router.get('/session/history/:value', function (req, res) {
    logger.info('sessionId :'+req.params.value);
    Session.findOne(
        {_id: req.params.value},
        function (err, sessionFinded) {
        if (err) {
            logger.error('Error while getting current session:' + err);
        }
        if (_.isNull(sessionFinded) || _.isEmpty(sessionFinded)) {
            Session.find().exec(function (err, sessions) {
                logger.info(sessions);
                res.render('Administration/back-history-session', {sessions: sessions});
            });
        } else {
            Order.find({})//.find({user:req.params.value})
                .populate('user')
                .exec(function (err, orders) {
                    if (err) logger.error(err.message);
                    //logger.debug('Orders:' + orders);

                    //res.json(orders);
                    Pizza.find().exec(function (err, pizzas) {
                        //res.json(pizzas);
                        logger.debug('displaying retrieved  session :' + sessionFinded);
                        res.render('Administration/back-history-details-session', {
                            liveSession: sessionFinded,
                            orders: orders,
                            pizzas: pizzas
                        });
                    });
                });

        }
    });
    //res.write('hello');
});

module.exports = router;
