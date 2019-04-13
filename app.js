var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require("express-session");
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

// const initialSiteRouter = require("./routes/initial-site")
const publicRouter = require("./routes/public");
const dashboardRouter = require("./routes/dashboard");
const usersRouter = require("./routes/users");


var app = express();
var oktaClient = new okta.Client({
  orgUrl: 'https://dev-571992.oktapreview.com',
  token: '00tP4gZgZK2aWHdLJCRVOYBFA_m4U9_dh3R8liQemI'
});
const oidc = new ExpressOIDC({
  issuer: "https://dev-571992.oktapreview.com/oauth2/default",
  client_id: '0oaiqyrooi3wE3YSo0h7',
  client_secret: '6f5cSABfCYgYp8RMJ7V4zhbs097qdu1BA6KHTwgu',
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'NJASKFNJSBIALSBCISDUBLADBCASDBCBASDLIC',
  resave: true,
  saveUninitialized: false
}));

app.use(oidc.router);
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  oktaClient.getUser(req.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});

function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).render("unauthenticated");
  }

  next();
}

// app.use('/', publicRouter);
//app.use('/', initialSiteRouter);
app.use('/', express.static('static_website'))
app.use('/dashboard', loginRequired, dashboardRouter, function(req,res){
  if(req.user.newUser){
      req.user.newUser = false;
      req.user.save(function(err){
          if(err) return handleError(err);
          res.redirect("/error");
      })
  }
});
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
