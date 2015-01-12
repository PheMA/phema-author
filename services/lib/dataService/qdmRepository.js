var request = require('request');

QDMRepository = function(baseURL) {
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
      callback({message: 'Unable to retrieve the list of QDM dataElements'});
    }
  });
}

exports.QDMRepository = QDMRepository;