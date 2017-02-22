'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var UserRepository = require('../user/phema-user').UserRepository;
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
  //*********  DON'T CHECK ME IN *************
  //app.use('/api', expressJwt({secret: 'somesecret'}));
  // *****************************************
  app.use(passport.initialize());
};

exports.login = function (req, res, next) {
  console.log('POST - /login')

  passport.authenticate('local', function(err, user) {
    if (err || !user) {
      return res.status(401).send({'error' : 'Invalid username or password' });
    }

    req.logIn(user, function(err) {
      if (err) { return res.status(401).send({'error' : 'Invalid username or password' }) };

      // If user is found and password is right, create a token
      var token = jwt.sign(user, 'somesecret', {
        expiresIn: 1440 // expires in 24 hours
      });

      res.status(200).json({
        success: true,
        token: token,
        user: user
      });
    });
  })(req, res, next);
};

exports.logout = function(req, res) {
  console.log('GET - /logout')
  req.logout();
  res.redirect('/');
};

exports.passport = passport;