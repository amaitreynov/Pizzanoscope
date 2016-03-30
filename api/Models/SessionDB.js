/**
 * Created by Thomas on 28/03/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderDB = require('./OrderDB');


var Session = new Schema({
    name: { type: String, required: true},
    orderList: { type: [{type: Schema.ObjectId, ref: 'Order'}], required: false },
    startHour: { type: Date, required: true, default: Date.now },
    endHour: { type: Date, required: false },
    active: { type: Boolean, required: true },
    pizzaPrice: {type: Number, required: false},
    providerPrice: {type: Number, required: false},
    totalPrice: {type: Number, required: false},
    requestData: {type: String, required: false},
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});

Session.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

exports.Session = mongoose.model('Session', Session);