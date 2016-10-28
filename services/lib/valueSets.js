'use strict';
var request = require('request');


// Provides a simple wrapper around the CTS2 web service
// We wrap this so we can safely invoke from our client without having to
// worry about cross-domain requests.

var ValueSetRepository = function(baseURL) {
  this.baseURL = baseURL;
}

ValueSetRepository.prototype.getValueSets = function(callback) {
  request(this.baseURL + 'valuesets?format=json', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of value sets'});
    }
  });
}

ValueSetRepository.prototype.searchValueSets = function(search, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valuesets?matchvalue=' + search + '&format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      console.log(response);
      callback({message: 'Unable to search the list of value sets'});
    }
  });
}

ValueSetRepository.prototype.getValueSet = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valueset/' + id + '?format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value sets'});
    }
  });
}

ValueSetRepository.prototype.getValueSetMembers = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valueset/' + id + '/resolution?format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value set members'});
    }
  });
}

ValueSetRepository.prototype.add = function(callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valueset/' + id + '/resolution?format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to add the value set'});
    }
  });
}

exports.ValueSetRepository = ValueSetRepository;