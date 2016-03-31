/**
 * Created by Thomas on 28/03/2016.
 */

var mongoose = require('mongoose');
var _ = require('lodash');
var logger = require('log4js').getLogger('utils.sessions');
var moment = require('moment');
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
module.exports.createSession = function (req, next) {
    logger.info('Creating a new session...');
    //logger.debug(moment(req.body.CreateSessionEndDate+' '+req.body.CreateSessionEndHour,'YYYY-MM-DD HH:mm'));
    var session = new Session({
        name: req.body.CreateSessionName,
        startHour: Date.now(),
        endHour: moment(req.body.CreateSessionEndDate + ' ' + req.body.CreateSessionEndHour, 'YYYY-MM-DD HH:mm'),
        active: true,
        pizzaPrice: req.body.CreateSessionPizzaPrice,
        providerPrice: req.body.CreateSessionProviderPrice
    });

    session.save(function (err, sessionCreated) {
        if (err) {
            logger.error('Error while creating the ' + err);
            return next(err, null);
        }
        else {
            var schedule = require('node-schedule');
            var date = new Date(2016, 03, 30, 11, 58, 0);

            var j = schedule.scheduleJob(date, function () {
                logger.debug('The world is going to end today.');
            });//moment(req.body.CreateSessionEndDate+' '+req.body.CreateSessionEndHour,'YYYY-MM-DD HH:mm')+60);
            logger.debug(j);
            return next(null, sessionCreated);
        }
    });
};

/*
 - Action: Adds an order to the orderList attribute of the provided session
 - Returns: callback with the updated session
 */
module.exports.addOrderInSessionOrderList = function (orderToAdd, next) {
    logger.info('Adding the order ' + JSON.stringify(orderToAdd._id) + ' to orderList of current session...');
    //get the current session
    //get the orderList
    //update the order list
    //update the price
    exports.getCurrentSession(function (err, session) {
        if (err) {
            return next(err, null);
        }
        else {
            //TODO move that in another split function
            // logger.debug('Received session: ', session);
            //check if totalPrice is null or empty
            var newTotalPrice = session.totalPrice;
            // logger.debug('Session totalPrice before: ' + newTotalPrice);

            //calculate new session totalPrice
            if(newTotalPrice){
                //set the totalPrice
                logger.debug('totalPrice exists, adding new order totalPrice to it');
                newTotalPrice += orderToAdd.totalPrice;
            }
            else if(!newTotalPrice){
                logger.debug('totalPrice doesn\'t exist, setting it to new order\s totalPrice');
                newTotalPrice = orderToAdd.totalPrice;
            }
            // logger.debug('Final newTotalPrice: ' + newTotalPrice);

            //update orderList
            // logger.debug('Incoming orderListTemp: ' + session.orderList);
            var orderListTemp = session.orderList;
            // logger.debug('Created object orderListTemp: ' + orderListTemp);
            orderListTemp.push(orderToAdd._id);
            // logger.debug('Final orderListTemp: ' + orderListTemp);

            Session.findOneAndUpdate(
                {_id: session._id},
                {
                    $set: {
                        updated_at: Date.now(),
                        orderList: orderListTemp,
                        totalPrice: newTotalPrice
                    }
                },
                {new: true},
                function (err, sessionUpdated) {
                    if (err) {
                        return next(err, null);
                    }
                    if (_.isNull(sessionUpdated) || _.isEmpty(sessionUpdated)) {
                        return next({error: 'Bad object from DB for session'}, null);
                    }
                    else {
                        // logger.debug('Updated order:' + orderUpdated);
                        return next(null, sessionUpdated);
                    }
                });
        }
    });
};

/*
 - Action: Gets the orderList attribute from the given session
 - Returns: callback with the found orderList
 */
module.exports.getOrderFromSession = function (sessionId, next) {
    logger.info('Getting orderList from session ' + JSON.stringify(sessionId));
    Session.findOne({_id: sessionId},
        function (err, session) {
            if (err)
                return next(err, null);
            if (_.isNull(session.orderList) || _.isEmpty(session.orderList)) {
                return next({error: 'Bad object from DB for orderList'}, null);
            }
            else {
                //logger.debug('Order pizzas:'+order.pizzaList);
                return next(null, session.orderList);
            }
        });
};

/*
 - Action: Removes the given order from the given session
 - Returns: the session with updated orderList attribute
 */
//TODO add error in callback return if error happens
module.exports.removeOrderFromSession = function (order, sessionToUpdate, next) {
    logger.info('Deleting order ' + order._id + ' from session\'s orderList ' + sessionToUpdate.orderList);

    //TODO calculate new total price

    Session.findOne({_id: sessionToUpdate._id},
        function (err, sessionFinded) {
            //TODO catch error in this function if happens
            //logger.debug('Deleting Pizza :'+pizza);
            var orderListTemp = sessionFinded.orderList;
            var orderIdToRemove = order._id;
            orderListTemp.forEach(function (item) {
                logger.debug('Item :' + item);
                logger.debug('order Id to remove :'+orderIdToRemove);
                if (orderIdToRemove == item) {
                    logger.debug('order to remove :' + orderIdToRemove);
                    orderListTemp.splice(orderListTemp.indexOf(item), 1);
                    //logger.debug(PizzaListTemp.indexOf(item));
                }
                //logger.debug('Current pizzaList '+pizzaListTemp);
            });
            // logger.debug('updated pizzaList to update ' + pizzaListTemp);

            sessionFinded.update(
                {
                    $set: {
                        updated_at: Date.now(),
                        orderList: orderListTemp
                    }
                },
                {new: true},
                function (err) {
                    if (err) {
                        return next(err, null);
                    }
                    else {
                        return next(null, sessionFinded);
                    }
                });
        });
};

module.exports.updateSessionTotalPrice = function (flag, incPrice, next){

    //get current session
    //update session's totalPrice
    exports.getCurrentSession(function (err, session) {
        if (err) {
            return next(err, null);
        }
        else {
            var newTotalPrice = session.totalPrice;
            //calculate new session totalPrice
            if(flag === '+'){
                newTotalPrice += incPrice;
            }
            else if(flag === '-'){
                newTotalPrice -= incPrice;
            }

            Session.findOneAndUpdate(
                {_id: session._id},
                {
                    $set: {
                        updated_at: Date.now(),
                        totalPrice: newTotalPrice
                    }
                },
                {new: true},
                function (err, sessionUpdated) {
                    if (err) {
                        return next(err, null);
                    }
                    if (_.isNull(sessionUpdated) || _.isEmpty(sessionUpdated)) {
                        return next({error: 'Bad object from DB for session'}, null);
                    }
                    else {
                        // logger.debug('Updated order:' + orderUpdated);
                        return next(null, sessionUpdated);
                    }
                });
        }
    });
};

/*
 - Action: delete the given order from the DB
 - Returns: callback (see returned callbacks in code for details)
 */
// module.exports.deleteOrder = function (orderToDelete, next) {
//     logger.info('Deleting order ' + orderToDelete._id);
//
//     //find the order to delete
//     Order.findOne({_id: orderToDelete._id},
//         function (err, order) {
//             if (err) {
//                 return next(err);
//             }
//             if (_.isNull(order) || _.isEmpty(order)) {
//                 return next({error: 'Bad object from DB for order'});
//             }
//             else {
//                 // logger.debug('orderToRemove :' + order);
//
//                 //delete the order 1st
//                 Order.remove({_id: orderToDelete._id},
//                     function (err, orderRemoved) {
//                         if (err) {
//                             return next(err);
//                         }
//                         if (_.isNull(orderRemoved) || _.isEmpty(orderRemoved)) {
//                             return next({error: 'Empty or null cb from mongoose remove order'});
//                         }
//                         else {//order as been removed
//
//                             logger.debug('Number of rows affected :' + orderRemoved);
//
//                             //then the pizzas in order
//                             order.pizzaList.forEach(function (item) {
//                                 Pizza.remove({_id: item}, function (err, pizzaRemoved) {
//                                     if (err) {
//                                         return next(err);
//                                     }
//                                     if (_.isNull(pizzaRemoved) || _.isEmpty(pizzaRemoved)) {
//                                         return next({error: 'Empty or null cb from mongoose remove pizza'});
//                                     }
//                                 });
//                             });
//
//                             // logger.debug('alright');
//                             //return next
//                             return next(null);
//                         }
//                     });
//             }
//         });
// };
