/**
 * Created by Antoine on 24/11/2015.
 */
var path = require("path"),
    config = require("./../config.json"),
    logger = require('log4js').getLogger('utils.create_user'),
    User = require(path.join(__dirname, "models", "user.js")),
    mongoose_uri = process.env.MONGOOSE_URI || "localhost/express-jwt-auth";

var args = process.argv.slice(2);

var username = args[0];
var password = args[1];

if (args.length < 2) {
    logger.info("usage: node %s %s %s", path.basename(process.argv[1]), "user", "password");
    process.exit();
}

logger.info("Username: %s", username);
logger.info("Password: %s", password);

logger.info("Creating a new user in Mongo");

var mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect(mongoose_uri);
mongoose.connection.on('error', function () {
    logger.info('Mongoose connection error', arguments);
});

mongoose.connection.once('open', function callback() {
    logger.info("Mongoose connected to the database");

    var user = new User();

    user.username = username;
    user.password = password;

    user.save(function (err) {
        if (err) {
            logger.error(err);
        } else {
            logger.info(user);
        }
        process.exit();
    });
});