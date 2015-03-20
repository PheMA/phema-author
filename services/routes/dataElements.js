var request = require('request');
var http = require('http');
var QDMRepository = require('../lib/dataService/qdmRepository.js').QDMRepository;
//var repository = new QDMRepository('http://23.22.63.122:8080/QDM2RDF/rest/qdm');
var repository = new QDMRepository('http://www.projectphema.org:8080/QDM2RDF/rest/qdm');

exports.index = function(req, res){
  if (req.params.type === 'categories') {
    repository.getCategories(function(error, data) {
      if (error) {
        res.status(400).send(error);
      }
      else {
        res.set('Content-Type', 'application/json');
        res.status(200).send(data);
      }
    });
  }
  else if (req.params.type === 'elements') {
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
  else if (req.params.type === 'temporalOperators') {
    repository.getTemporalOperators(function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
    });
  }
  else if (req.params.type === 'logicalOperators') {
    repository.getLogicalOperators(function(error, data) {
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


exports.attributes = function(req, res){
  if (req.params.type === 'datatype' || req.params.type === 'datatypes' || req.params.type === 'dataElement') {
    // We allow a few aliases for what is a QDM datatype.  We will be sure to normalize to the right
    // name for the QDM API, otherwise our call will fail.
    if (req.params.type !== 'datatype') {
      req.params.type = 'datatype';
    }
    repository.getAttributes(req.params.type, req.params.item, function(error, data) {
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