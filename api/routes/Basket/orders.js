var express = require('express');
var mongoose = require('mongoose');
var logger = require('log4js').getLogger('controller.orders');
var router = express.Router();
var paypal = require('paypal-rest-sdk');
var Cookies = require("cookies");
var UtilsOrder = require('../../Utils/orderUtils');
var Order = mongoose.model('Order');
var Pizza = mongoose.model('Pizza');
var User = mongoose.model('User');
var Class = mongoose.model('Class');
var config = require('../../config.json');
var jwt = require('jsonwebtoken');


router.get('/getAll', function(req, res, next) {
    Order.
    find().
    exec(function(err, orders){
        res.json(orders);
    });
});

router.get('/paypal', function(req, res, next) {
    var configSandbox = {
        'mode' : 'sandbox',
        'client_id' : 'ARfucPqNEtupis2zq9BubXeUs5n6CEPZAbs7fz5nGqZorhvg0yJWhUf6sPVUy8qjQRiWfcWsvD-S2_1b',
        'client_secret' : 'EPaERZ8uHaNr4RUQTX48_6kSf7nuTEvknDM27fawwg0bU7saeQnO-SQJNHrGDX5cQT9waV-uartGM0rV'
    };

    var configLive = {
        'mode' : 'live',
        'client_id' : 'AV6X4wDSvU7ovhLZ6Asbaz_AdaEOoaHNcv1t3SXHKCv2r3IVLPb2q8j9jb8Pqq6mHPwvC7jTVPj5it_g',
        'client_secret' : 'EFUHUkFmATKtn-MIaXq-gYpUIJI8mdFV0mB_EYvT_eDXvXeKoODVEB7-OwPu-BoTksA2S2PGM3nK2toN'
    };

    paypal.configure(configSandbox);

    var paymentDescription = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/api/order/success",
            "cancel_url": "http://localhost:3000/api/order/fail"
        },
        "transactions": [{
            "item_list": {
                "items": []
            },
            "amount": {
                "currency": "EUR",
                "total": "0.00"
            },
            "description": "Votre commande de pizza."
        }]
    };

    var cookieOrder = new Cookies(req, res).get("order");

    if(cookieOrder != undefined && cookieOrder != null && cookieOrder != "") {
        parseOrderPaypalJson(paymentDescription, cookieOrder);
        paypal.payment.create(paymentDescription, configSandbox, function (error, payment) {
            if (error) {
                logger.error(error);
            } else {
                if (payment.payer.payment_method === 'paypal') {
                    //req.session.paymentId = payment.id;
                    var redirectUrl;
                    for (var i = 0; i < payment.links.length; i++) {
                        var link = payment.links[i];
                        if (link.method === 'REDIRECT') {
                            redirectUrl = link.href;
                        }
                    }
                    res.redirect(redirectUrl);
                }
            }
        });
    }else{
        res.redirect('/api/pizza/getAll');
    }
});

router.get('/success', function(req, res) {
    var cookieOrder = new Cookies(req, res).get("order");
    var cookieJson = JSON.parse(cookieOrder);
    Order.
    update({_id: cookieJson._id},
        {$set: {
            state: "payed"
        }},
        {multi:true}).
    exec(function(){
        res.clearCookie('order');
        res.redirect('/api/pizza/');
    });
});

router.get('/fail', function(req, res) {
    res.redirect('/api/pizza/getAll');
});

function parseOrderPaypalJson(paymentDescription, order){
    var total = 0;
    var orderJson = JSON.parse(order);
    for(var i = 0; i<orderJson.pizzaList.length; i++){
        var pizza = orderJson.pizzaList[i];
        paymentDescription.transactions[0].item_list.items.push({
            "name": pizza.name + " " + pizza.sizeType + " " + pizza.doughType,
            "sku": pizza.name,
            "price": pizza.price,
            "currency": "EUR",
            "quantity": 1
        });
        total += pizza.price;

        paymentDescription.transactions[0].amount.total = total;
    }
}



router.get('/cleanOrder/:value1', function(req, res) {

    Order.findOne({_id: req.params.value1}, function(err,order) {
        if(err) logger.info(err.message);

        order.pizzaList.forEach(function(item) {
            Pizza.remove({_id: item}, function(err) {
                if(err) logger.info(err.message);
            });
        });

        Order.remove({_id: order._id}, function(err) {
            if(err) logger.info(err.message);
        });
    });

    res.clearCookie('order');
    res.redirect('/api/pizza/getAll');
});



module.exports = router;