'use strict';
var request = require('request');


// Provides a simple wrapper around the QDM2RDF web service
// We wrap this so we can safely invoke from our client without having to
// worry about cross-domain requests.

var QDMRepository = function(baseURL) {
  this.baseURL = baseURL;
}

QDMRepository.prototype.getCategories = function(callback) {
  request(this.baseURL + '/categories', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of QDM categories'});
    }
  });
}

QDMRepository.prototype.getDataElements = function(callback) {
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

QDMRepository.prototype.getLogicalOperators = function(callback) {
  request(this.baseURL + '/logicalOperators', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of QDM logic operators'});
    }
  });
}

QDMRepository.prototype.getTemporalOperators = function(callback) {
  request(this.baseURL + '/temporalOperators', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of QDM temporal operators'});
    }
  });
}

QDMRepository.prototype.getSubsetOperators = function(callback) {
  request(this.baseURL + '/subsetOperators', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of QDM subset operators'});
    }
  });
}

QDMRepository.prototype.getFunctionOperators = function(callback) {
  request(this.baseURL + '/functions', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of QDM functions'});
    }
  });
}

QDMRepository.prototype.getAttributes = function(type, item, callback) {
  request(this.baseURL + '/' + type + '/' + item + '/attributes', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of QDM attributes'});
    }
  });
}

exports.QDMRepository = QDMRepository;