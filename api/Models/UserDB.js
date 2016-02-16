/**
 * Created by Ezehollar on 13/11/2015.
 */
var mongoose = require('mongoose'),
    bcrypt = require("bcryptjs"),
    ClassDB = require('./ClassDB');

var Class = mongoose.model('Class');

var Schema = mongoose.Schema;


var User = new Schema({
    firstname: { type: String, required: true},
    lastname: { type: String, required: true},
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true},
    avatar: { type: String, required: true},
    address: { type: String },
    phoneNumber: { type: String, required: true},
    admin: { type: Boolean, required: true },
    verified: { type: Boolean, required: true, default: false },
    class: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    updated_at: { type: Date, required: true, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

User.pre('save', function (next) {
    var user = this;
    var now = new Date();

    //mis � jour �l�ment de controle(Created_at, Updated_at)
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }

    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

User.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

exports.User = mongoose.model('User', User);