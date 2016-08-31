'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
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
  app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
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