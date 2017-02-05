'use strict';
var request = require('request-json');
const util = require('util')

// Utility functions to wrap CTS2 specifics.  This is used by our CTS2 service wrappers
// so that we can minimize the amount of code in those files and isolate it here.
// Anything that is PhEMA-specific should exist in other files, such as the ValueSetRepository.
var CTS2Util = function(baseURL) {
  this.client = request.createClient(baseURL);
  this.client.headers['content-type'] = 'application/json';
}

// Wrap up common error handling code to avoid duplicating it.  This will
// handle invoking the callback if an error condition is encountered.
function handleError(error, expectedStatusCode, response, callback) {
  if (error) {
    console.log('Error:', error);
    callback({message: 'Error: ' + error});
    return true;
  }
  else if (response.statusCode !== expectedStatusCode) {
    console.log('Invalid Status Code Returned:', response.statusCode);
    console.log(response.body);
    callback({message: 'Invalid Status Code Returned:' + response.statusCode})
    return true;
  }

  return false;
}

CTS2Util.prototype.createChangeSet = function(callback) {
  console.log('In createChangeSet');
  this.client.post('changeset', {}, function(error, response, body) {
    if (!handleError(error, 201, response, callback)) {
      console.log("Created CTS2 changeset");
      var locationElements = response.headers['location'].split('/');
      callback(null, locationElements[locationElements.length - 1]);
    }
  });
}

CTS2Util.prototype.createValueSet = function(changeSet, data, callback) {
  console.log('In createValueSet');
  this.client.post('valueset?changesetcontext=' + changeSet, data, function(error, response, body) {
    if (!handleError(error, 200, response, callback)) {
      console.log("Created CTS2 value set");
      callback(null, true);
    }
  });
}

CTS2Util.prototype.updateValueSet = function(oid, changeSet, data, callback) {
  console.log('In updateValueSet');
  this.createValueSet(changeSet, data, callback);
  // this.client.put('valueset/' + oid + '?changesetcontext=' + changeSet, data, function(error, response, body) {
  //   if (!handleError(error, 200, response, callback)) {
  //     console.log("Updated CTS2 value set");
  //     callback(null, true);
  //   }
  // });
}

CTS2Util.prototype.createValueSetDefinition = function(changeSet, data, callback) {
  console.log('In createValueSetDefinition');
  this.client.post('valuesetdefinition?changesetcontext=' + changeSet, data, function(error, response, body) {
    if (!handleError(error, 200, response, callback)) {
      console.log("Created CTS2 value set definition");
      callback(null, true);
    }
  });
}

CTS2Util.prototype.updateValueSetDefinition = function(oid, version, changeSet, data, callback) {
  console.log('In updateValueSetDefinition');
  this.client.put('valueset/' + oid + '/definition/' + version + '?changesetcontext=' + changeSet, data, function(error, response, body) {
    if (!handleError(error, 204, response, callback)) {
      console.log("Created CTS2 value set definition");
      callback(null, true);
    }
  });
}

CTS2Util.prototype.findValueSet = function(oid, callback) {
  console.log('In findValueSet, searching for ' + oid);
  this.client.get('valueset/' + oid + '?format=json', function(error, response, body) {
    if (response.statusCode === 404) {
      console.log("Value set not found");
      return callback(null, null);
    }
    if (!handleError(error, 200, response, callback)) {
      console.log("Found CTS2 value set");
      callback(null, JSON.parse(response.body));
    }
  });
}

exports.CTS2Util = CTS2Util;