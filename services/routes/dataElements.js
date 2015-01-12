var request = require('request');
var http = require('http');
var QDMRepository = require('../lib/dataService/qdmRepository.js').QDMRepository;

exports.index = function(req, res){
  var callback = function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  }

  var repository = new QDMRepository('http://23.22.63.122:8080/QDM2RDF/rest/qdm');
  if (req.params.type === 'categories') {
    //repositoryFunction = function(callback) { repository.getCategories(callback); };
    //repositoryFunction = repository.getCategories;
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
    //repositoryFunction = function(callback) { repository.getDataElements(callback); };
    //repositoryFunction = repository.getDataElements;
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

  //repositoryFunction(callback);

  // repositoryFunction(function (error, data) {
  //   if (error) {
  //     res.status(400).send(error);
  //   }
  //   else {
  //     res.set('Content-Type', 'application/json');
  //     res.status(200).send(data);
  //   }
  // });
};
