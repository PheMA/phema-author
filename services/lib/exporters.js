'use strict';
var MONGO_CONNECTION = 'mongodb://localhost/phema-author';

var request = require('request');
var exec = require('child_process').exec;
var mongojs = require('mongojs');
var db = mongojs(MONGO_CONNECTION, ['exporterTempFiles']);

var exporterConfig = [
  {
    id: "hqmf",
    name: "HQMF",
    description: "HL7 Health Quality Measure Format (HQMF)",
    invokeAs: 'function'
  },
  {
    id: "phema",
    name:"PhEMA (JSON)",
    description: "Native format created by the authoring tool",
    invokeAs: 'function'
  },
  {
    id: "knime",
    name: "KNIME",
    description: "Creates an executable KNIME workflow",
    invokeAs: 'program',
    invokeParams: ''
  }
];

exports.exporters = exporterConfig;

///////////////////////////////////////////////////////////////////////////////
// The ExporterRepository can be configured to use NeDB (for lightweight persistance),
// or MongoDB (default configuration)
//
// Schema for entries in the tempFiles repository:
//   _id  (string)       Auto-generated ID by the database system
//   definition (JSON)   The phenotype algorithm created in the authoring tool
//   createdOn (Date)    The date and time this record was created
//   updatedOn (Date)    The most recent date and time this record was updated
//   status (string)     Can be one of:   processing | completed | error
///////////////////////////////////////////////////////////////////////////////
var ExporterRepository = function() {
  this.tempFiles =  db.collection('exporterTempFiles');
}

ExporterRepository.prototype.saveDefinitionForProcessing = function(definition, callback) {
  this.tempFiles.insert({ definition: definition, createdOn: new Date(), status: 'processing' }, function (err, savedRecord) {
    if (err === null) {
      callback({id: savedRecord._id, status: 'processing'});
    }
    else {
      callback(null, {message: 'Unable to add a record to track processing'});
    }
  });
}

ExporterRepository.prototype.markAsCompleted = function(id, callback) {
  this.tempFiles.update({_id: mongojs.ObjectId(id)}, { $set: { definition: null, status: 'completed', updatedOn: new Date() } }, {}, function (err, numReplaced) {
    if (err === null) {
      callback({id: id, status: 'completed'});
    }
    else {
      callback(null, {message: 'Unable to update the status of the processing record'});
    }
  });
}


ExporterRepository.prototype.markAsError = function(id, callback) {
  this.tempFiles.update({_id: mongojs.ObjectId(id)}, { $set: { status: 'error', updatedOn: new Date() } }, {}, function (err, numReplaced) {
    if (err === null) {
      callback({id: id, status: 'error'});
    }
    else {
      callback(null, {message: 'Unable to update the status of the processing record'});
    }
  });
}

ExporterRepository.prototype.getStatus = function(id, callback) {
  this.tempFiles.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
    console.log(doc);
    if (err === null && doc !== null) {
      callback({id: doc._id, status: doc.status, updatedOn: doc.updatedOn});
    }
    else {
      callback(null, {message: 'No record was found with that ID'});
    }
  });
}

exports.ExporterRepository = ExporterRepository;


exports.run = function(exporterKey, definition, callback) {
  var index = 0;
  var exportDef = null;
  for (index = 0; index < exporterConfig.length; index++) {
    if (exporterConfig[index].id === exporterKey) {
      exportDef = exporterConfig[index];
      break;
    }
  }

  if (exportDef == null) {
    callback(null, {message: 'The exporter definition (' + exporterKey + ') could not be found.' });
    return;
  }

  // Although it may not be needed, our first step is to put the definition into a
  // lightweight store.  That way a processor can reference it later, and we have a
  // saved definition if we need to reprocess.  The expectation is the store will be
  // cleaned out, so it's not intended for long-term logging or storage.
  var repository = new ExporterRepository();
  repository.saveDefinitionForProcessing(definition, function(data, error) {
    if (error) {
      console.log(error);
      callback(null, error);
    }
    else {
      console.log('Started processing with temp record id: ' + data.id);
      if (exportDef.invokeAs === 'program') {
        console.log('processing as program');
        exec('sleep 25', function (error, stdout, stderr) {
          if (error) {
            repository.markAsError(data.id, function(data, error) {
              console.log('All done - error');
            });
          }
          else {
            repository.markAsCompleted(data.id, function(data, error) {
              console.log('All done - success');
            });
          }
        });
      }
      else if (exportDef.invokeAs === 'function') {
        console.log('processing as inline function');
      }
      callback(data);
    }
  });
}

