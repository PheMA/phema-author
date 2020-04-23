var request = require('request');
var http = require('http');
var CQLRepository = require('../lib/dataService/cqlRepository.js').CQLRepository;
var repository = new CQLRepository(process.env.CQL_DER_SERVICE_URL);

exports.index = function(req, res){
  if (req.params.type === 'elements' || req.params.type === 'datatypes') {
    repository.getElements(function(error, data) {
      if (error) {
        res.status(400).send(error);
      }
      else {
        res.set('Content-Type', 'application/json');
        res.status(200).send(data);
      }
    });
  }
  else {
    res.status(404).send({message: 'The API does not support this operation'});
  }
};

exports.element = function(req, res){
  if (req.params.type && req.params.type !== '') {
    repository.getElement(req.params.type, function(error, data) {
      if (error) {
        res.status(400).send(error);
      }
      else {
        res.set('Content-Type', 'application/json');
        res.status(200).send(data);
      }
    });
  }
  else {
    res.status(404).send({message: 'The API does not support this operation'});
  }
};