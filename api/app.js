"use strict";

var debug = require('debug')('app:' + process.pid),
    path = require("path"),
    fs = require("fs"),
    http_port = process.env.HTTP_PORT || 3000,
    https_port = process.env.HTTPS_PORT || 3443,
    mongoose_uri = process.env.MONGOOSE_URI || "mongodb://root:root@ds057934.mongolab.com:57934/pizzanoscope",
   //mongoose_uri = process.env.MONGOOSE_URI || "mongodb://localhost:27017/pizzaNoScope",
    onFinished = require('on-finished'),
    NotFoundError = require(path.join(__dirname, "errors", "NotFoundError.js")),
    profile = require('./routes/profile'),
    signUp = require('./routes/signUp'),
    product = require('./routes/product'),
    basket = require('./routes/basket'),
    orders = require('./routes/orders'),
    default_r = require('./routes/default'),
    admin = require('./routes/admin'),
    utils = require("./Utils/utils.js"),
    jwt = require('jsonwebtoken'),
    config = require('./config.json'),
    Cookies = require("cookies");

console.log("-- Starting application --");

console.log("-- Initializing  Mongoose --");
var mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.connect(mongoose_uri);
mongoose.connection.on('error', function () {
  console.log('Mongoose connection error');
});
mongoose.connection.once('open', function callback() {
    console.log("-- Mongoose connected to the database --");
    console.log("-- Application Ready ! --");
});

console.log("-- Initializing express --");
var express = require('express'), app = express();

console.log("-- Initializing Swig --");
var swig = require('swig');

// This is where all the magic happens!
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });

console.log("-- Initializing plugins --");
app.use(require('morgan')("dev"));
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('compression')());
app.use(require('response-time')());

/*app.use(function (req, res, next) {

  onFinished(res, function (err) {
    console.log("[%s] finished request", req.connection.remoteAddress);
  });

  next();

});*/

//ROUTING
//MIDDLEWARE
app.use(function (req, res, next) {
    var token = new Cookies(req, res).get('access_token');

    console.log('-- NO CONNECTION REQUIRED -- TEST');
    if(utils.isDisconnectedLink(req.url)){
        console.log('-- NO CONNECTION REQUIRED -- OK');
        next();
    }else{
        if(token){
            jwt.verify(token, config.secret, function(err, decoded) {
                console.log('-- CONNECTION REQUIRED -- TEST');
                if(err)
                {

                    res.send("Connected required link");
                }
                else
                {
                    console.log('-- CONNECTION REQUIRED & ADMIN -- TEST');
                    if(utils.isAdminRequiredLink(req.url) && decoded.admin == false)
                    {
                        console.log('-- CONNECTION REQUIRED & ADMIN -- NO');
                        res.send("Admin required link");
                    }
                    else
                    {
                        console.log('-- CONNECTION REQUIRED -- OK');
                        next();
                    }
                }


            });
        }else{
            res.send("Connected required link");
        }
    }
});

app.use("/", default_r);
app.use("/api", default_r);
app.use("/api/profile", profile);
app.use("/api/signUp", signUp);
app.use('/api/product', product);
app.use('/api/basket', basket);
app.use('/api/orders', orders);
app.use('/api/admin', admin);


// all other requests redirect to 404
app.all("*", function (req, res, next) {
  next(new NotFoundError("404"));
});

// error handler for all the applications
app.use(function (err, req, res, next) {

  var errorType = typeof err,
      code = 500,
      msg = {   title: "Internal Server Error: ",
                message: err.message,
                stack: err.stack};

  switch (err.name) {
    case "UnauthorizedError":
      code = err.status;
      msg = undefined;
      break;
    case "BadRequestError":
    case "UnauthorizedAccessError":
    case "NotFoundError":
      code = err.status;
      msg = err.inner;
      break;
    default:
      break;
  }

  return res.status(code).json(msg);

});

//console.log("Creating HTTP server on port: %s", http_port);
require('http').createServer(app).listen(http_port, function () {
  console.log("HTTP Server listening on port: %s, in %s mode", http_port, app.get('env'));
});

//console.log("Creating HTTPS server on port: %s", https_port);
require('https').createServer({
  key: fs.readFileSync(path.join(__dirname, "keys", "ia.key")),
  cert: fs.readFileSync(path.join(__dirname, "keys", "ia.crt")),
  ca: fs.readFileSync(path.join(__dirname, "keys", "ca.crt")),
  requestCert: true,
  rejectUnauthorized: false
}, app).listen(https_port, function () {
  console.log("HTTPS Server listening on port: %s, in %s mode", https_port, app.get('env'));
});

module.exports = app;
