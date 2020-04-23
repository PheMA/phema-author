'use strict';
var request = require('request');


// Provides a simple wrapper around the QDM2RDF web service
// We wrap this so we can safely invoke from our client without having to
// worry about cross-domain requests.

var CQLRepository = function(baseURL) {
  this.baseURL = baseURL;
}

CQLRepository.prototype.getElements = function(callback) {
  request(this.baseURL + '/datatypes', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of CQL elements'});
    }
  });
}

CQLRepository.prototype.getElement = function(type, callback) {
  request(this.baseURL + '/datatype/' + type + '/attributes', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the CQL element'});
    }
  });
}

exports.CQLRepository = CQLRepository;