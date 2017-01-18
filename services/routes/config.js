var request = require('request');
var exporters = require('../lib/exporters');
var configuration = require('../../configuration');

exports.index = function(req, res){
  res.set('Content-Type', 'application/json');
  res.status(200).send(configuration.all());
};

/**
 * Returns the information for all configured exporters
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.exporters = function(req, res){
  res.set('Content-Type', 'application/json');
  res.status(200).send(configuration.exporters());
};