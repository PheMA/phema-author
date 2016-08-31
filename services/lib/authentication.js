'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var UserRepository = require('./user').UserRepository;
var repository = new UserRepository();

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(email, password, done) {
    repository.authenticate(email, password, function(err, user){
      done(err, user);
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  repository.getUser(id, function (err, user) {
    return done(err, user);
  });
});

exports.initialize = function(app) {
  app.use(session({
      secret: 'keyboard cat',
      saveUninitialized: false, // don't create session until something stored
      resave: false, //don't save session if unmodified
      store: new MongoStore({
        url: 'mongodb://localhost/phema-author',
        ttl: 14 * 24 * 60 * 60 // = 14 days. Default
      })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
};

exports.login = function (req, res, next) {
  console.log('POST - /login')

  passport.authenticate('local', function(err, user) {
    if (err || !user) {
      return res.status(400).send(err);
    }

    req.logIn(user, function(err) {
      if (err) { throw err; }
      return res.status(200).json(user);
    });
  })(req, res, next);
};

exports.logout = function(req, res) {
  console.log('GET - /logout')
  req.logout();
  res.redirect('/');
};

exports.passport = passport;