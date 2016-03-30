/**
 * Created by Ezehollar on 13/11/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var UserDB = require('./UserDB');
var PizzaDB = require('./PizzaDB');

var User = mongoose.model('User');
var Pizza = mongoose.model('Pizza');


var Order = new Schema({
    pizzaList: { type: [{type: Schema.ObjectId, ref: 'Pizza'}], required: true },
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    state: { type: String, required: true, trim: true },
    paymentType: { type: String, required: true, trim: true },
    totalPrice: { type: Number, required: true},
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});

Order.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

exports.Order = mongoose.model('Order', Order);