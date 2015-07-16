'use strict';
var request = require('request');
var fs = require('fs');


var UnitRepository = function(baseURL) {
  this.baseURL = baseURL;
}

UnitRepository.prototype.getUnits = function(callback) {
  fs.readFile('./services/data/units.json', function (error,data) {
    if (error) {
      console.log(error);
      callback({message: 'Unable to retrieve the list of units'});
    }
    else {
      callback(null, data);
    }
  });
}

exports.UnitRepository = UnitRepository;