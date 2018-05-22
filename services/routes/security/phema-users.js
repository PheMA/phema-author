var request = require('request');
var sanitizer = require('sanitizer');
var util = require('../../lib/util');
var UserRepository = require('../../lib/user/phema-user').UserRepository;
var repository = new UserRepository();

function buildUserFromAllowedParameters(req) {
  var user = {
    email: sanitizer.escape(req.body.email),
    firstName: sanitizer.escape(req.body.firstName),
    lastName: sanitizer.escape(req.body.lastName)
  };

  // We only accept passwords if a password and confirmation is provided,
  // and they both match.  Otherwise, we set an error response that can
  // be sent to the client.
  if (req.body.password) {
    if (req.body.confirmPassword && req.body.password === req.body.confirmPassword) {
      user.password = req.body.password;
    }
    else {
      return {"message" : "The password and confirmation must match"};
    }
  }

  if (req.params.id) {
    user.id = req.params.id;
  }

  return user;
}

/**
 * Finds a user by their username
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.details = function(req, res){
  console.log("GET - /api/user/:id");
  repository.getUser(req.params.id, function(error, data) {
    util.respondJSON(res, error, data);
  });
};

/**
 * Adds a user
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.add = function(req, res) {
  console.log('POST - /api/user');
  var user = buildUserFromAllowedParameters(req);
  if (user.message) {
    util.respondJSON(res, user);
  }
  else {
    repository.addUser(user, function(error, data) {
      util.respondJSON(res, error, data);
    });
  }
};

/**
 * Update a user, given their ID
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.update = function(req, res) {
  console.log("PUT - /api/user/:id");
  var user = buildUserFromAllowedParameters(req);
  if (user.message) {
    util.respondJSON(res, user);
  }
  else {
    repository.updateUser(user, function(error, data) {
      util.respondJSON(res, error, data);
    });
  }
};

exports.resources = function(req, res){
  console.log("GET - /api/user/:id/resources");
  util.respondJSON(res, error, {});
};