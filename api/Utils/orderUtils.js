/**
 * Created by Ezehollar on 26/11/2015.
 */
var mongoose = require('mongoose');
var sanitizer = require('sanitizer');
var _ = require('lodash');
var logger = require('log4js').getLogger('utils.orders');
var OrderDB = require('../Models/OrderDB');
var Order = mongoose.model('Order');
var Pizza = mongoose.model('Pizza');
var User = mongoose.model('User');
var Class = mongoose.model('Class');
var sessionUtils = require('./sessionUtils');

/*
 - Action: Adds a pizza to  the pizzaList attribute of the provided order
 - Returns: callback with the updated order
 */
//TODO add session update
module.exports.addPizzaInOrderPizzaList = function (pizzaToAdd, orderToUpdate, next) {
    logger.info('adding the pizza ' + JSON.stringify(pizzaToAdd._id) + ' to pizzaList of order ' + JSON.stringify(orderToUpdate._id));

    //calculate new order totalPrice
    var newTotalPrice = orderToUpdate.totalPrice;
    newTotalPrice += pizzaToAdd.price;

    //update the pizzaList
    var pizzaListTemp = orderToUpdate.pizzaList;
    pizzaListTemp.push(pizzaToAdd._id);
    // logger.debug('pizzalistTemp: ' + pizzaListTemp);

    Order.findOneAndUpdate(
        {_id: orderToUpdate._id},
        {
            $set: {
                updated_at: Date.now(),
                pizzaList: pizzaListTemp,
                totalPrice: newTotalPrice
            }
        },
        {new: true},
        function (err, orderUpdated) {
            if (err) {
                return next(err, null);
            }
            if (_.isNull(orderUpdated) || _.isEmpty(orderUpdated)) {
                return next({error: 'Bad object from DB for pizza'}, null);
            }
            else {
                // logger.debug('Updated order:' + orderUpdated);
                return next(null, orderUpdated);
            }
        });
};

/*
 - Action: Gets the pizzaList attribute from the given order
 - Returns: callback with the found pizzaList
 */
module.exports.getPizzasFromOrder = function (orderId, next) {
    logger.info('Getting pizzaList from order ' + JSON.stringify(orderId));
    Order.findOne({_id: orderId},
        function (err, order) {
            if (err)
                return next(err, null);
            if (_.isNull(order.pizzaList) || _.isEmpty(order.pizzaList)) {
                return next({error: 'Bad object from DB for pizzaList'}, null);
            }
            else {
                //logger.debug('Order pizzas:'+order.pizzaList);
                return next(null, order.pizzaList);
            }
        });
};

/*
 - Action: Creates a pizza with the provided details in query
 - Returns: callback with the created pizza, error otherwise
 */
//TODO add session update
module.exports.createPizza = function (req, next) {
    logger.info('Creating pizza with name \' ' + sanitizer.escape(req.params.value1));
    //get current session to have pizza price infos & other stuff
    sessionUtils.getCurrentSession(function (err, session) {
        if (err) {
            return next(err, null);
        }
        else {
            //create pizza
            var pizza = new Pizza({
                name: sanitizer.escape(req.params.value1),
                description: "Description Pizza",
                price: session.pizzaPrice,
                sizeType: "Large",
                doughType: "Classic"
            });

            pizza.save(function (err, savedPizza) {
                if (err) {
                    return next(err, null);
                }
                if (_.isNull(savedPizza) || _.isEmpty(savedPizza)) {
                    return next({error: 'Bad object from DB for pizza'}, null);
                }
                else {
                    // logger.debug('Created pizza:' + savedPizza);
                    return next(null, savedPizza);
                }
            });
        }
    });
};

/*
 - Action: Creates an order for the provided user with the provided pizza
 - Returns: callback with the created order, error otherwise
 */
//TODO add session update
module.exports.createOrder = function (user, pizza, next) {
    logger.info('Creating order with pizza ' + pizza._id + ' for user: ' + user._id);

    //create order with pizzalist
    var order = new Order({
        "pizzaList": [pizza._id],
        "user": user,
        "state": "TOBEPAID",
        "paymentType": "PayPal",
        "totalPrice": pizza.price
    });

    order.save(function (err, savedOrder) {
        if (err) {
            return next(err, null);
        }
        if (_.isNull(savedOrder) || _.isEmpty(savedOrder)) {
            return next({error: 'Bad object from DB for order'}, null);
        }
        else {
            // logger.debug('Created order:' + savedOrder);
            return next(null, savedOrder);
        }
    });
};

/*
 - Action: Removes the given pizza from the given order
 - Returns: the order with updated pizzaList attribute
 */
//TODO add session update
//TODO add error in callback return if error happens
module.exports.removePizzaFromOrder = function (pizza, orderToUpdate, next) {
    logger.info('Deleting pizza ' + pizza._id + ' from order\'s pizzaList ' + orderToUpdate.pizzaList);

    Order.findOne({_id: orderToUpdate._id},
        function (err, orderFinded) {
            //TODO catch error in this function if happens
            //logger.debug('Deleting Pizza :'+pizza);
            var newPrice = orderFinded.totalPrice;
            var pizzaListTemp = orderFinded.pizzaList;
            pizzaListTemp.forEach(function (item) {
                // logger.debug('Item :' + item);
                if (pizza._id.equals(item)) {
                    // logger.debug('Removed Pizza :' + item);
                    pizzaListTemp.splice(pizzaListTemp.indexOf(item), 1);
                    newPrice -= pizza.price;
                    logger.debug('New price: ', newPrice);
                    //logger.debug(PizzaListTemp.indexOf(item));
                }
                //logger.debug('Current pizzaList '+pizzaListTemp);
            });
            // logger.debug('updated pizzaList to update ' + pizzaListTemp);

            orderFinded.update(
                {
                    $set: {
                        updated_at: Date.now(),
                        pizzaList: pizzaListTemp,
                        totalPrice: newPrice
                    }
                },
                {new: true},
                function (err) {
                    if (err) {
                        return next(err, null);
                    }
                    else {
                        return next(null, orderFinded);
                    }
                });
        });
};

/*
 - Action: delete the given order from the DB
 - Returns: callback (see returned callbacks in code for details)
 */
//TODO add session update
module.exports.deleteOrder = function (orderToDelete, next) {
    logger.info('Deleting order ' + orderToDelete._id);

    //find the order to delete
    Order.findOne({_id: orderToDelete._id},
        function (err, order) {
            if (err) {
                return next(err);
            }
            if (_.isNull(order) || _.isEmpty(order)) {
                return next({error: 'Bad object from DB for order'});
            }
            else {
                // logger.debug('orderToRemove :' + order);

                //delete the order 1st
                Order.remove({_id: orderToDelete._id},
                    function (err, orderRemoved) {
                        if (err) {
                            return next(err);
                        }
                        if (_.isNull(orderRemoved) || _.isEmpty(orderRemoved)) {
                            return next({error: 'Empty or null cb from mongoose remove order'});
                        }
                        else {//order as been removed

                            logger.debug('Number of rows affected :' + orderRemoved);

                            //then the pizzas in order
                            order.pizzaList.forEach(function (item) {
                                Pizza.remove({_id: item}, function (err, pizzaRemoved) {
                                    if (err) {
                                        return next(err);
                                    }
                                    if (_.isNull(pizzaRemoved) || _.isEmpty(pizzaRemoved)) {
                                        return next({error: 'Empty or null cb from mongoose remove pizza'});
                                    }
                                });
                            });

                            // logger.debug('alright');
                            //return next
                            return next(null);
                        }
                    });
            }
        });
};
