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
    logger.info('Creating a new session...');

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
            logger.error('Error while creating the session' + err);
            return next(err, null);
        }
        else {
            return next(null, sessionCreated);
        }
    });
};

/*
 - Action: Adds an order to the orderList attribute of the provided session
 - Returns: callback with the updated session
 */
module.exports.addOrderInSessionOrderList = function (orderToAdd, sessionToUpdate, next) {
    logger.info('Adding the order ' + JSON.stringify(orderToAdd._id) + ' to orderList of order ' + JSON.stringify(sessionToUpdate._id));

    //calculate new session totalPrice
    var newTotalPrice = sessionToUpdate.totalPrice;
    newTotalPrice += orderToAdd.totalPrice;

    //update orderList
    var orderListTemp = sessionToUpdate.pizzaList;
    orderListTemp.push(orderToAdd._id);
    // logger.debug('pizzalistTemp: ' + pizzaListTemp);

    Session.findOneAndUpdate(
        {_id: sessionToUpdate._id},
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
                return next({error: 'Bad object from DB for pizza'}, null);
            }
            else {
                // logger.debug('Updated order:' + orderUpdated);
                return next(null, sessionUpdated);
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
            orderListTemp.forEach(function (item) {
                // logger.debug('Item :' + item);
                if (order.equals(item)) {
                    // logger.debug('Removed Pizza :' + item);
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