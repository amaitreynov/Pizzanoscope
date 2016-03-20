/**
 * Created by Antoine on 04/02/2016.
 */
var config = require('./config'),
    mongoose = require("mongoose"),
    logger = require('log4js').getLogger('controller.utils.sendEmail'),
    ES = config.smtp,
    Mailgun = require('mailgun-js'),
    securityUtils = require('./securityUtils'),
    EM = {};
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
module.exports = EM;

//TODO refactor code in such a way that we declare mailgun instance and send message only once
EM.dispatchAccountValidationLink = function (user, callback) {
// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
    var auth = {
        auth: {
            api_key: 'key-7d3e1a0c62fc2084098e00ff32f0c06d',
            domain: 'sandboxfc7fd911df6643e88fd945a63667ccb9.mailgun.org'
        }
    };

    var nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail({
        from: ES.sender,
        to: user.email, // An array if you have multiple recipients.
        subject: 'Email validation',
        text: EM.composeEmailAccountValidation(user) // html body
    }, function (err, info) {
        if (err) {
            logger.error("got an error: "+err.message);
            callback(err);
        }
        else {
            logger.debug('Message sent to mail:' + user.email);
            logger.info('Response: ' + info);
            callback();
        }
    });
};

EM.dispatchResetPasswordLink = function (user, token, callback) {
// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
    var auth = {
        auth: {
            api_key: 'key-7d3e1a0c62fc2084098e00ff32f0c06d',
            domain: 'sandboxfc7fd911df6643e88fd945a63667ccb9.mailgun.org'
        }
    };

    var nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail({
        from: ES.sender,
        to: user.email, // An array if you have multiple recipients.
        subject: 'Password recovery',
        text: EM.composeEmailResetPassword(user, token), // html body
    }, function (err, info) {
        if (err) {
            logger.error("got an error: "+err.message);
            callback(err);
        }
        else {
            logger.debug('Message sent to mail:' + user.email);
            logger.info('Response: ' + info);
            callback();
        }
    });
};

EM.dispatchResetPasswordConfirmation = function (user, callback) {
    // This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
    var auth = {
        auth: {
            api_key: 'key-7d3e1a0c62fc2084098e00ff32f0c06d',
            domain: 'sandboxfc7fd911df6643e88fd945a63667ccb9.mailgun.org'
        }
    };

    var nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail({
        from: ES.sender,
        to: user.email, // An array if you have multiple recipients.
        subject: 'Password reset confirmation',
        text: EM.composeEmailResetPasswordConfirmation(user) // html body
    }, function (err, info) {
        if (err) {
            logger.error("got an error: "+err.message);
            callback(err);
        }
        else {
            logger.debug('Message sent to mail:' + user.email);
            logger.info('Response: ' + info);
            callback();
        }
    });
};

EM.composeEmailAccountValidation = function (o) {
    //todo make a generic link with req.headers.host
    var link = 'http://localhost:3000/api/validate/' + o.email;
    logger.debug('Link created:' + link);
    var html = "<html><body>";
    html += "Hi " + o.firstname + ",<br><br>";
    html += "Your username is : <b>" + o.username + "</b><br><br>";
    html += "<a href='" + link + "'>Please click here to validate your account</a><br><br>";
    html += "If you can't click the link, copy/pasterino this in your browser : <b>" + link + "</b><br><br>";
    html += "Cheers,<br>";
    html += "</body></html>";
    logger.debug('html created:' + html);
    return html;
};

EM.composeEmailResetPassword = function (user, token) {
    //todo make a generic link with req.headers.host
    var link = 'http://localhost:3000/api/reset/' + token;
    logger.debug('Link created:' + link);
    var html = "<html><body>";
    html += "Hi " + user.firstname + ",<br><br>";
    html += "You are receiving this because you (or someone else) have requested the reset of the password for your account.</b><br><br>";
    html += "Please click on the following link, or paste this into your browser to complete the process:<br><br>";
    html += "<a href='" + link + "'>Reset password</a><br><br>";
    html += "If you can't click the link, copy/pasterino this in your browser : <b>" + link + "</b><br><br>";
    html += "If you did not request this, please ignore this email and your password will remain unchanged.<br><br>";
    html += "Cheers,<br>";
    html += "</body></html>";
    logger.debug('html created:' + html);
    return html;
};

EM.composeEmailResetPasswordConfirmation = function (user) {
    var html = "<html><body>";
    html += "Hi " + user.firstname + ",<br><br>";
    html += "This is a confirmation that the password for your account " + user.email + " has just been changed.</b><br><br>";
    html += "Cheers,<br>";
    html += "</body></html>";
    logger.debug('html created:' + html);
    return html;
};