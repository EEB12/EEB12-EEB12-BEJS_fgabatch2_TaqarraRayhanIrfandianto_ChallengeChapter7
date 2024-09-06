require("./config/instrument.js");
var Sentry = require("@sentry/node");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport')

var cors = require('cors');
const routes = require("./routes");
var app = express();
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);
Sentry.setupExpressErrorHandler(app);
module.exports = app;
