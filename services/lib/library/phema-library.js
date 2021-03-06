'use strict';
var request = require('request');


// Provides a simple wrapper around the QDM2RDF web service
// We wrap this so we can safely invoke from our client without having to
// worry about cross-domain requests.

var LibraryRepository = function(baseURL) {
  this.baseURL = baseURL;
}

LibraryRepository.prototype.getItems = function(callback) {
  request(this.baseURL + '/library', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of items'});
    }
  });
};

LibraryRepository.prototype.getItem = function(id, callback) {
  request(this.baseURL + '/library/' + id, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the item'});
    }
  });
};

LibraryRepository.prototype.addItem = function(item, callback) {
  request.post(this.baseURL + '/library/', {json: item}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to add the item'});
    }
  });
};

LibraryRepository.prototype.updateItem = function(item, callback) {
  request.put(this.baseURL + '/library/' + item.id, {json: item}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to update the item'});
    }
  });
};

LibraryRepository.prototype.deleteItem = function(id, callback) {
  request.del(this.baseURL + '/library/' + id, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to delete the item'});
    }
  });
};

exports.LibraryRepository = LibraryRepository;