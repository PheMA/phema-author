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
     
     // Have to parse the body for the image 
      try {
        body = JSON.parse(body);
      } catch(e) {
        console.log("error parsing phekb response to saving phenotype ", e);
      }
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the item'});
    }
  });
};

LibraryRepository.prototype.addItem = function(item, callback) {
  console.log("repo putting add item image ", item.image);
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
      callback({message: 'Unable to update the item: ', error: error});
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

LibraryRepository.prototype.repositories = function(callback) {
  request(this.baseURL + '/library/repositories', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to get repository list'});
    }
  });
};


exports.LibraryRepository = LibraryRepository;