var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');

require('./config/passport')(passport);

// var index = require('./routes/index');
var company = require('./routes/company');

var app = express();

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.set('view options', {
    layout: './layouts/company-layout.hbs'
});

app.set('port', process.env.PORT || 3000);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//section Helper
hbs.registerHelper('section', function (name, options) {
    if (!this._sections)
        this._sections = {};
    this._sections[name] = options.fn(this);
});

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'vidyapathaisalwaysrunning',
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

require('./routes/routes.js')(app, passport);
app.use('/company', company);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;