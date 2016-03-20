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

module.exports.addPizzaInOrderPizzaList = function (pizzaToAdd, orderToUpdate, next) {
    logger.info('adding the pizza '+JSON.stringify(pizzaToAdd)+' to pizzaList of order '+JSON.stringify(orderToUpdate));

    var pizzaListTemp = orderToUpdate.pizzaList;
    pizzaListTemp.push(pizzaToAdd._id);
    logger.debug('pizzalistTemp: '+pizzaListTemp);
    
    Order.findOneAndUpdate(
        {_id: orderToUpdate._id},
        {
            updated_at: Date.now(),
            pizzaList: pizzaListTemp
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
                logger.debug('Updated order:' + orderUpdated);
                return next(null, orderUpdated);
            }
        });
};

module.exports.getPizzasFromOrder = function (orderId, next) {
    logger.info('Getting pizzaList from order '+JSON.stringify(orderId));
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

module.exports.createPizza = function (req, next) {
    logger.info('Creating pizza....');
    //create pizza
    var pizza = new Pizza({
        name: sanitizer.escape(req.params.value1),
        description: "Description Pizza",
        price: sanitizer.escape(req.params.value2.substr(0, 2)),
        sizeType: "Large",
        doughType: "Classic"
    });

    pizza.save(function (err, savedPizza) {
        if (err)
            return next(err, null);

        if (_.isNull(savedPizza) || _.isEmpty(savedPizza)) {
            return next({error: 'Bad object from DB for pizza'}, null);
        }
        else {
            logger.debug('Created pizza:' + savedPizza);
            return next(null, savedPizza);
        }
    });
};

module.exports.createOrder = function (user, pizzaList, next) {
    logger.info('Creating order with pizzaList '+pizzaList+' for user: '+JSON.stringify(user));
    //create order with pizzalist
    var order = new Order({
        "pizzaList": [pizzaList],
        "user": user,
        "state": "TOBEPAID",
        "paymentType": "PayPal"
    });

    order.save(function (err, savedOrder) {
        if (err)
            return next(err, null);

        if (_.isNull(savedOrder) || _.isEmpty(savedOrder)) {
            return next({error: 'Bad object from DB for order'}, null);
        }
        else {
            logger.debug('Created order:' + savedOrder);
            return next(null, savedOrder);
        }
    });
};

//TODO add error in callback return if error happens
module.exports.deletePizzaIntoOrder = function (pizza, orderToUpdate, next) {
    logger.info('Deleting pizza from order\'s pizzaList...');
    //TODO catch error in this function if happens
    var pizzaListTemp = orderToUpdate.pizzaList;
    pizzaListTemp.forEach(function (item) {
        if (pizza._id == item._id) {
            pizzaListTemp.splice(pizzaListTemp.indexOf(item), 1);
            //console.log(PizzaListTemp.indexOf(item));
        }
    });

    Order.findOneAndUpdate(
        {_id: orderToUpdate._id},
        {
            updated_at: Date.now(),
            pizzaList: pizzaListTemp
        },
        {w: 1},
        {new:true},
        function (err, updatedOrder) {
            if (err) {
                return next(err, null);
            }
            else {
                return next(null,updatedOrder);
            }
        });
};
