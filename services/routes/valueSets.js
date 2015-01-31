var request = require('request');
var ValueSetRepository = require('../lib/valueSets').ValueSetRepository;
var repository = new ValueSetRepository('https://informatics.mayo.edu/vsmc/cts2/');

exports.index = function(req, res){
  repository.getValueSets(function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};

exports.search = function(req, res){
  repository.searchValueSets(req.params.search, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};

/**
 * Finds a value set by its ID
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.details = function(req, res){
  console.log("GET - /api/valueSet/:id");
  repository.getValueSet(req.params.id, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};