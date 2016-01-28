/**
 * Created by Ezehollar on 13/11/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pizza = new Schema({
    name: { type: String, required: true},
    description: { type: String, required: true },
    price: { type: Number, required: true },
    sizeType: { type: String, required: true },
    doughType: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now }
});

Pizza.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

exports.Pizza = mongoose.model('Pizza', Pizza);