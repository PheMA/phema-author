'use strict';
var request = require('request');


// Provides a simple wrapper around the QDM2RDF web service
// We wrap this so we can safely invoke from our client without having to
// worry about cross-domain requests.

var FHIRRepository = function(baseURL) {
  this.baseURL = baseURL;
}

FHIRRepository.prototype.getDataElements = function(callback) {
  request(this.baseURL + '/datatypes', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of QDM datatypes'});
    }
  });
}

exports.FHIRRepository = FHIRRepository;