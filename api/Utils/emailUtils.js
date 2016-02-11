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
module.exports = EM;

EM.dispatchAccountValidationLink = function (user, callback) {

    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    var mailgun = new Mailgun({
        apiKey: 'key-7d3e1a0c62fc2084098e00ff32f0c06d',
        domain: 'sandboxfc7fd911df6643e88fd945a63667ccb9.mailgun.org'
    });
    logger.debug('Transporter:' + JSON.stringify(mailgun));

    // send mail
    var data = {
        //Specify email data
        from: 'labodevtest@gmail.com',
        //The email to contact
        to: user.email,
        //Subject and text data
        subject: 'Hello from Mailgun',
        html: EM.composeEmailAccountValidation(user) // html body
    };

    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            //res.render('error', { error : err});
            logger.error("got an error: ", err);
            return callback(err);
        }
        //Else we can greet    and leave
        else {
            logger.debug('Message sent' + JSON.stringify(body)+' to mail:'+user.email);
            callback(null, user.email);
        }
    });
};

EM.dispatchResetPasswordLink = function (user, callback) {
   //todo to implement
};

EM.composeEmailAccountValidation = function (o) {
    var link = 'http://localhost:3000/api/validate/'+ o.email;
    logger.debug('Link created:'+link);
    var html = "<html><body>";
    html += "Hi " + o.firstname + ",<br><br>";
    html += "Your username is : <b>" + o.username + "</b><br><br>";
    html += "<a href='" + link + "'>Please click here to validate your account</a><br><br>";
    html += "If you can't click the link, copy/pasterino this in your browser : <b>" + link + "</b><br><br>";
    html += "Cheers,<br>";
    html += "<a href='http://twitter.com/braitsch'>braitsch</a><br><br>";
    html += "</body></html>";
    logger.debug('html created:'+html);
    return html;
};

EM.composeEmailResetPassword = function (o) {
    var link = 'http://localhost:3000/reset-password?e=' + o.email + '&p=' + o.pass;
    logger.debug('Link created:'+link);
    var html = "<html><body>";
    html += "Hi " + o.firstname + ",<br><br>";
    html += "Your username is : <b>" + o.username + "</b><br><br>";
    html += "<a href='" + link + "'>Please click here to reset your password</a><br><br>";
    html += "Cheers,<br>";
    html += "<a href='http://twitter.com/braitsch'>braitsch</a><br><br>";
    html += "</body></html>";
    logger.debug('html created:'+html);
    return html;
};