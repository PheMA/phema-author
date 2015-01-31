var request = require('request');
var http = require('http');
var FHIRRepository = require('../lib/dataService/fhirRepository.js').FHIRRepository;
var repository = new FHIRRepository('http://23.22.63.122:8080/QDM2RDF/rest/fhir');

exports.index = function(req, res){
  if (req.params.type === 'elements' || req.params.type === 'datatypes') {
    repository.getDataElements(function(error, data) {
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