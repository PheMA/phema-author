var request = require('request');
var exporters = require('../lib/exporters');
var configuration = require('../../configuration');

exports.index = function(req, res){
  res.set('Content-Type', 'application/json');
  res.status(200).send(configuration.all());
};