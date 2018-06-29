'use strict';
var request = require('request');
var CTS2Util = require('../lib/cts2/cts2Util').CTS2Util;
const vsac = require('cql-exec-vsac');

// Provides a simple wrapper around the NLM VSAC web services
// We wrap this so we can safely invoke from our client without having to
// worry about cross-domain requests.

// id - the identifier of the repository, used to distinguish it from other value sets
// baseURL - the base URL to the VSAC endpoint, including the trailing slash
var VSACRepository = function(id, baseURL) {
  console.log(baseURL);
  this.id = id;
  this.baseURL = baseURL;
  this.cts2Util = new CTS2Util(baseURL);
};

VSACRepository.prototype.getValueSets = function(callback) {
  request(this.baseURL + 'valuesets?format=json', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of value sets'});
    }
  });
};

VSACRepository.prototype.searchValueSets = function(search, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valuesets?matchvalue=' + search + '&format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to search the list of value sets'});
    }
  });
};

VSACRepository.prototype.getValueSet = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valueset/' + id + '?format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value sets'});
    }
  });
};

VSACRepository.prototype.getValueSetMembers = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valueset/' + id + '/resolution?format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value set members'});
    }
  });
};


exports.VSACRepository = VSACRepository;