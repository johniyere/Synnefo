'use strict';

// aquire the packages
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

// make the controllers (I think)
//var routes = require('./routes/index');
var help = require('./routes/help')
var fileBrowser = require('./routes/projects');
var editor = require('./routes/editor');
var console = require('./routes/console');
var imgupload = require('./routes/imgupload');
var api = require('./routes/api')
var home = require('./routes/home');
var __testRouter = require('./__tests/routes.js');
var profile = require('./routes/profile');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/synnefo');

// make the app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/profilephoto/view', express.static(path.join(__dirname, path.join('storage', 'userIcons'))));
app.use('/profilephoto/view', express.static(path.join(__dirname, path.join('public', path.join('images', 'profile_icons')))));

// uploading
app.use(multer({dest:'./uploads/'}).array('multiInputFileName[]'));

//Flash middleware to store messages in session
var flash = require('connect-flash');
app.use(flash());

//Passport stuff
//------------------------------------------------------------------------------

var passport = require('passport');
var expressSession = require('express-session');

app.use(expressSession({
  secret: 'D98u451k6h-MS3$iQzK/&HO1yCT8Dj',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport
var initPassport = require('./models/init');
initPassport(passport);

//-----------------------------------------------------------------------------
//Passport end

// Pass user details into the view layouts
//-------------------------------------------------------------
app.use(function(req, res, next) {
  var isAuthenticated = req.isAuthenticated();
  res.locals.user = {
    isAuthenticated : isAuthenticated,
    details : isAuthenticated ? req.user : null
  };
  next();
});
//-------------------------------------------------------------
//User details end

// controllers (I think)

app.use(favicon(__dirname + '/public/images/favicon.ico'));

var routes = require('./routes/index')(passport);
app.use('/', routes);
app.use('/', home);
app.use('/imgupload', imgupload);
app.use('/projects', fileBrowser);
app.use('/editor', editor);
app.use('/console', console);
app.use('/__test', __testRouter);
app.use('/api', api);
app.use('/help', help);
app.use('/profile', profile);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// return
module.exports = app;

