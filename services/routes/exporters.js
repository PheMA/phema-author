var request = require('request');
var exporters = require('../lib/exporters');
var repository = new exporters.ExporterRepository();

exports.invoke = function(req, res){
  var exporterId = req.params.exporter;
  console.log('POST - /export/' + exporterId);
  var definition = req.body.definition;

  exporters.run(exporterId, definition, function(data, error) {
    if (error) {
      console.log(error);
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};

exports.status = function(req, res){
  var status = repository.getStatus(req.params.id, function(data, error){
    if (error) {
      console.log(error);
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};

exports.result = function(req, res){
  var status = repository.getEntry(req.params.id, function(data, error){
    if (error) {
      console.log(error);
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', data.mime_type);
      res.set('Content-Length', data.result.length());
      res.set('Content-disposition', 'attachment; filename=' + data.id + '.' + data.extension);
      res.status(200).send(data.result.buffer);
    }
  });
};