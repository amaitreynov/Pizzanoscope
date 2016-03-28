/**
 * Created by Thomas on 28/03/2016.
 */

var mongoose = require('mongoose');
var _ = require('lodash');
var logger = require('log4js').getLogger('utils.orders');
var SessionDB = require('../Models/SessionDB');
var Session = mongoose.model('Session');
var OrderDB = require('../Models/OrderDB');
var Order = mongoose.model('Order');
var Pizza = mongoose.model('Pizza');
var User = mongoose.model('User');
var Class = mongoose.model('Class');

/*
 - Action: Gets the current session object and return it
 - Returns: callback with the current session if found
 error if it's the case or if object from db is null/empty
 */
module.exports.getCurrentSession = function (next) {
    logger.info('Getting the current session...');
    Session.findOne({active: true},
        function (err, session) {
            if (err) {
                return next(err, null);
            }
            if (_.isNull(session) || _.isEmpty(session)) {
                return next({error: 'Bad object from DB for session'}, null);
            }
            else {
                return next(null, session);
            }
        });
};

/*
 - Action: Creates a new session object in DB
 - Returns: callback with the created session 
 error if it's the case or if object from db is null/empty
 */
//TODO add parameters needed to create the session
module.exports.createSession = function (next) {
    logger.info('Cerating a new session...');

    var session = new Session({
        name: 'session1',
        startHour: Date.now(),
        endHour: null,
        active: true,
        pizzaPrice: null,
        providerPrice: null
    });

    session.save(function (err, sessionCreated) {
        if (err) {
            logger.error('Error while creating the ' + err);
            return next(err, null);
        }
        else {
            return next(null, sessionCreated);
        }
    });
};

/*
 - Action: Creates a new session object in DB
 - Returns: callback with the created session 
 error if it's the case or if object from db is null/empty
 */
//TODO add parameters needed to create the session
module.exports.updateSession = function (next) {
    logger.info('Cerating a new session...');
    exports.getCurrentSession(function(err, session){
        
    });
    var session = new Session({
        name: 'session1',
        startHour: Date.now(),
        endHour: null,
        active: true,
        pizzaPrice: null,
        providerPrice: null
    });

    session.save(function (err, sessionCreated) {
        if (err) {
            logger.error('Error while creating the ' + err);
            return next(err, null);
        }
        else {
            return next(null, sessionCreated);
        }
    });
};