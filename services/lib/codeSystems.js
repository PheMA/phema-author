'use strict';
var request = require('request');


// Provides a simple wrapper around the CTS2 web service
// We wrap this so we can safely invoke from our client without having to
// worry about cross-domain requests.

var CodeSystemRepository = function(baseURL) {
  this.baseURL = baseURL;
}

CodeSystemRepository.prototype.searchCodeSystem = function(codesystem, version, search, callback) {
  //request({rejectUnauthorized: false, url: this.baseURL + 'valuesets?matchvalue=' + search + '&format=json'}, function(error, response, body) {
  request(this.baseURL + 'codesystem/' + codesystem + '/version/' + version + '/entities?q=' + search + '&format=json', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      console.log(response);
      callback({message: 'Unable to search the code system'});
    }
  });
}

exports.CodeSystemRepository = CodeSystemRepository;