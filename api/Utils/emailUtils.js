/**
 * Created by Antoine on 29/01/2016.
 */
var config = require('./config'),
    mongoose = require("mongoose"),
    logger = require('log4js').getLogger('controller.utils.email'),
    ES = config.smtp,
    xoauth2 = require("xoauth2"),
    TokenDB = require('../Models/TokenDB'),
    Token = mongoose.model('Token'),
    nodemailer = require('nodemailer'),
    EM = {};
module.exports = EM;

EM.dispatchResetPasswordLink = function (user, callback) {
    var transporter = EM.createTransporter();

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: ES.sender, // sender address
        to: user.email, // list of receivers
        subject: 'Password Reset', // Subject line
        text: 'something went wrong... :(', // plaintext body
        html: EM.composeEmailResetPassword(user) // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return callback(error);
        }
        logger.info('Message sent: ' + info.response);
        callback(null, user);

    });
};

EM.dispatchAccountValidationLinkTest = function (user, callback) {

    var transporter = EM.createTransporter();

    logger.debug('Transporter:'+ JSON.stringify(transporter));

    // send mail
    //TODO create dynamically
    transporter.sendMail({
        from: 'labodevtest@gmail.com',
        to: 'antoine.maitre@ynov.com',
        subject: 'hello world!',
        text: 'Authenticated with OAuth2'
    }, function (error, response) {
        if (error) {
            logger.error('Transporter sending mail failed:' + JSON.stringify(error));
        } else {
            logger.debug('Message sent' + JSON.stringify(response));
            callback(null, user);
        }
    });

    transporter.close();
};

EM.dispatchAccountValidationLink = function (user, callback) {
    var transporter = EM.createTransporter(user);
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: ES.sender, // sender address
        to: user.email, // list of receivers
        subject: 'Email validation', // Subject line
        text: 'To verify your email, click on the link below: ', // plaintext body
        html: EM.composeEmailAccountValidation(user) // html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return callback(error);
        }
        logger.info('Message sent: ' + info.response);
        callback(null, user);
    });
};

EM.composeEmailAccountValidation = function (o) {
    //TODO add create token
    var link = 'http://localhost:3000/verify/' + o.email;
    var html = "<html><body>";
    html += "Hi " + o.firstname + ",<br><br>";
    html += "Your username is :: <b>" + o.username + "</b><br><br>";
    html += "<a href='" + link + "'>Please click here to validate your account</a><br><br>";
    html += "Cheers,<br>";
    html += "<a href='http://twitter.com/braitsch'>braitsch</a><br><br>";
    html += "</body></html>";
    return html;
};

EM.composeEmailResetPassword = function (o) {
    var link = 'http://localhost:3000/reset-password?e=' + o.email + '&p=' + o.pass;
    var html = "<html><body>";
    html += "Hi " + o.firstname + ",<br><br>";
    html += "Your username is :: <b>" + o.username + "</b><br><br>";
    html += "<a href='" + link + "'>Please click here to reset your password</a><br><br>";
    html += "Cheers,<br>";
    html += "<a href='http://twitter.com/braitsch'>braitsch</a><br><br>";
    html += "</body></html>";
    return html;
};

//EM.generator = function(user) {
//    var xoauth2gen = xoauth2.createXOAuth2Generator({
//        user: user.email,
//        clientId: "{Client ID}",
//        clientSecret: "{Client Secret}",
//        refreshToken: "{User Refresh Token}",
//        customHeaders: {
//            "HeaderName": "HeaderValue"
//        },
//        customPayload: {
//            "payloadParamName": "payloadValue"
//        }
//    });
//    return xoauth2gen;
//};

EM.createTransporter = function(){
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(({
        service: 'gmail',
        auth: {
            user: 'labodevtest@gmail.com',
            pass: 'LaboDev69'
        }
    }));

    return transporter;
};
