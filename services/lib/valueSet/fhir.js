'use strict';

var request = require('request');

// id - the identifier of the repository, used to distinguish it from other value sets
// baseURL - the base URL to the CTS2 endpoint, including the trailing slash
var FHIRValueSetRepository = function(id, baseURL) {
  console.log(baseURL);
  this.id = id;
  this.baseURL = baseURL;
};

FHIRValueSetRepository.prototype.getValueSets = function(callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'ValueSet', json: true}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of value sets'});
    }
  });
};

FHIRValueSetRepository.prototype.searchValueSets = function(search, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'ValueSet?name:contains=' + search, json: true}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log('Unable to search the list of value sets');
      console.log(error);
      callback({message: 'Unable to search the list of value sets'});
    }
  });
};

FHIRValueSetRepository.prototype.getValueSet = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'ValueSet/' + id, json: true}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value sets'});
    }
  });
};

FHIRValueSetRepository.prototype.getValueSetMembers = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'ValueSet/' + id, json: true}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value set members'});
    }
  });
};

FHIRValueSetRepository.prototype.add = function(data, callback) {
  callback({message: 'FHIR value set repositories in PhEMA are not set up to save entries'});
};

exports.FHIRValueSetRepository = FHIRValueSetRepository;