'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var sgMail = require('@sendgrid/mail');
var async = require('async');
var crypto = require('crypto'); 
var UserRepository = require('../user/phema-user').UserRepository;
var util = require('../util');
var repository = new UserRepository();

const PASSWORD_RESET_DURATION = 1200000;  // 20 minutes
const PASSWORD_RESET_FIELD_DELIMITER = '|';
const PASSWORD_RESET_TOKEN_LENGTH = 32;

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
  app.use('/api', expressJwt({secret: process.env.PHEMA_USER_JWT_SECRET}).unless({path: [/\/api\/export/i]}));
  app.use(passport.initialize());
};

exports.login = function (req, res, next) {
  console.log('POST - /login');

  passport.authenticate('local', function(err, user) {
    if (err || !user) {
      return res.status(401).send({'error' : 'Invalid username or password' });
    }

    req.logIn(user, function(err) {
      if (err) { return res.status(401).send({'error' : 'Invalid username or password' }); }

      // If user is found and password is right, create a token
      var token = jwt.sign(user, process.env.PHEMA_USER_JWT_SECRET, {
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

exports.logout = function(req, res, next) {
  console.log('GET - /logout');
  req.logout();
  res.redirect('/');
};

// Derived from: http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
exports.forgotPassword = function(req, res, next) {
  console.log('POST - /forgotPassword');

  async.waterfall([
    function(done) {
      crypto.randomBytes(PASSWORD_RESET_TOKEN_LENGTH, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      repository.findUserByEmail(req.body.email, function(err, user) {
        if (err || !user) {
          console.log('Could not find the e-mail ' + req.body.email);
          done(null, null, {email: req.body.email, valid: false});
        }
        else {
          console.log('Creating a password reset token for ' + req.body.email);
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + PASSWORD_RESET_DURATION;

          repository.updateUser(user, function(err) {
            done(err, token, user);
          });
        }
      });
    },
    function(token, user, done) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      if (user == null || user.email == null || user.email === '') {
        console.log('We received an empty/null user - unable to send any reset e-mail');
        done('Please provide an e-mail address for the reset');
      }
      else if (token == null || user.valid === false) {
        console.log('Unknown e-mail in our system, so no reset message was sent to: ' + user.email);
        done(null, 'Password reset request processed for ' + user.email);
      }
      else {
        var resetToken = util.encrypt(user.email + PASSWORD_RESET_FIELD_DELIMITER + token);
        console.log('Sending password reset message to ' + user.email);
        var msg = {
          to: user.email,
          from: process.env.PASSWORD_RESET_EMAIL,
          subject: 'PhEMA Authoring Tool Password Reset',
          text: 'You are receiving this because you (or someone else) entered this e-mail when trying to reset the password of a PhEMA Authoring Tool account.\n\n' +
             'Please click on the following link, or paste this into your browser to complete the process (this link will be valid for the next 20 minutes):\n\n' +
             'https://' + req.headers.host + '/#/users/resetPassword/' + encodeURI(resetToken) + '\n\n' +
             'If you did not request this, please ignore this email and your password will remain unchanged.\n\n' +
             'Thank you,\n' +
             'The PhEMA Team\n' + 
             'https://projectphema.org'
        };
        sgMail.send(msg);
        done(null, 'Password reset request processed for ' + user.email);
      }
    }
  ], function(err) {
    if (err) {
      res.status(500).json({ success: false, error: err });
    }
    else {
      res.status(200).json({ success: true });
    }
  });
}

exports.resetPassword = function(req, res, next) {
  console.log('POST - /resetPassword');

  async.waterfall([
    function(done) {
      console.log('Finding e-mail by token: ' + req.body.token);
      var resetTokenData = util.decrypt(req.body.token).split(PASSWORD_RESET_FIELD_DELIMITER);
      if (resetTokenData == null || resetTokenData.length < 2) {
        done('Invalid password reset token for this e-mail address');
      }
      else {
        var email = resetTokenData[0];
        var token = resetTokenData[1];
        repository.findUserByPasswordResetToken(token, function(err, user) {
          if (err) {
            user = null;
            console.log("Error searching for user by token: " + err);
          }
          else {
            console.log('Found user associated with reset token');
          }
          done(err, user, email);
        });
      }
    },
    function(user, matchEmail, done) {
      if (user == null) {
        console.log('User e-mail or token invalid, or token expired');
        done('Invalid password reset token for this e-mail address');
      }
      if (user.email == null || user.email.localeCompare(matchEmail, undefined, { sensitivity: 'accent' }) !== 0) {
        console.log('Invalid user e-mail for token');
        done('Mistmatch between password reset request ' + matchEmail + ' and database record associated with token ' + user.email);
      }
      else if (req.body.password !== req.body.confirmPassword) {
        console.log('Passwords do not match');
        done('The password and confirmation password must match exactly');
      }
      else {
        console.log('Updating user password');
        user.password = req.body.password;
        repository.updateUser(user, function(err) {
          done(err, user);
        });
      }
    }
  ], function(err) {
    if (err) {
      res.status(500).json({ success: false, error: err });
    }
    else {
      res.status(200).json({ success: true });
    }
  });
}

exports.passport = passport;