'use strict';
var MONGO_CONNECTION = 'mongodb://localhost/phema-author';
var INPUT_EXTENSION = 'json';
var INPUT_DIRECTORY = '/opt/phema-hqmf-generator/temp/input/';

var request = require('request');
var exec = require('child_process').exec;
var mongojs = require('mongojs');
var mongo = require('mongodb');
var EchoExporter = require('./exporter/echo').EchoExporter;
var echoExport = new EchoExporter();
var db = mongojs(MONGO_CONNECTION, ['exporterTempFiles']);
var fs = require('fs');
var configuration = require('../../configuration');

// Initialize our exporters.  Although we have a basic definition available from the configuration
// code, there are internal details we are also setting up within here.
var exporterConfig = configuration.exporters();
exporterConfig['hqmf'].invokeAs = 'program';
exporterConfig['hqmf'].invokePath = 'BUNDLE_GEMFILE=/opt/phema-hqmf-generator/Gemfile bundle exec rake -f /opt/phema-hqmf-generator/lib/tasks/phema.rake phema:generate[{input},{output},hqmf,true]';
exporterConfig['hqmf'].inputDirectory = '/opt/phema-hqmf-generator/temp/input/';
exporterConfig['hqmf'].outputDirectory = '/opt/phema-hqmf-generator/temp/output/';
exporterConfig['hqmf'].outputExtension = 'zip';
exporterConfig['hqmf'].outputMIMEType = 'application/zip';

exporterConfig['hds-json'].name = "HQMF (JSON)";
exporterConfig['hds-json'].description = "A JSON format (based on HQMF) that is supported by the Health Data Standards library";
exporterConfig['hds-json'].invokeAs = 'program';
exporterConfig['hds-json'].invokePath = 'BUNDLE_GEMFILE=/opt/phema-hqmf-generator/Gemfile bundle exec rake -f /opt/phema-hqmf-generator/lib/tasks/phema.rake phema:generate[{input},{output},hds,true]';
exporterConfig['hds-json'].inputDirectory = '/opt/phema-hqmf-generator/temp/input/';
exporterConfig['hds-json'].outputDirectory = '/opt/phema-hqmf-generator/temp/output/';
exporterConfig['hds-json'].outputExtension = 'zip';
exporterConfig['hds-json'].outputMIMEType = 'application/zip';

exporterConfig['phema-json'].name = "PhEMA (JSON)";
exporterConfig['phema-json'].description = "Native format created by the authoring tool";
exporterConfig['phema-json'].invokeAs = 'function';
exporterConfig['phema-json'].fn = echoExport.echo;
exporterConfig['phema-json'].outputExtension = 'json';
exporterConfig['phema-json'].outputMIMEType = 'application/json';


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
//   result (BSON)       The generated file
//   mime_type (string)  The MIME type for returning the result
///////////////////////////////////////////////////////////////////////////////
var ExporterRepository = function() {
  this.tempFiles =  db.collection('exporterTempFiles');
}

ExporterRepository.prototype.saveDefinitionForProcessing = function(definition, callback) {
  this.tempFiles.insert({ definition: definition, createdOn: new Date(), status: 'processing' }, function (err, savedRecord) {
    if (err === null) {
      callback(savedRecord);
    }
    else {
      callback(null, {message: 'Unable to add a record to track processing'});
    }
  });
}

ExporterRepository.prototype.markAsCompleted = function(id, result, mimeType, extension, callback) {
  var binaryData = new mongo.Binary();
  binaryData.write(result, 0);
  this.tempFiles.update({_id: mongojs.ObjectId(id)}, { $set: { result: binaryData, mime_type: mimeType, extension: extension, status: 'completed', updatedOn: new Date() } }, {}, function (err, numReplaced) {
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
    console.log('Found status: ' + doc.status);
    if (err === null && doc !== null) {
      callback({id: doc._id, status: doc.status, updatedOn: doc.updatedOn});
    }
    else {
      callback(null, {message: 'No record was found with that ID'});
    }
  });
}

ExporterRepository.prototype.getEntry = function(id, callback) {
  this.tempFiles.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
    if (err === null && doc !== null) {
      console.log('Found entry');
      doc.id = doc._id;
      callback(doc);
    }
    else {
      console.log('Error: No record was found with that ID');
      callback(null, {message: 'No record was found with that ID'});
    }
  });
}

exports.ExporterRepository = ExporterRepository;

function establishInputFile(exportDef, definition, id, callback) {
  var inputFile = INPUT_DIRECTORY + id + '.' + INPUT_EXTENSION;
  fs.writeFile(inputFile, definition, 'utf8', function(err) {
    callback(inputFile, err);
  });
}


///////////////////////////////////////////////////////////////////////////////////////////////////
exports.run = function(exporterKey, definition, callback) {
  var exportDef = exporterConfig[exporterKey];
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
      var callbackResult = { id: data._id, status: data.status };

      console.log('Started processing with temp record id: ' + data._id);
      if (exportDef.invokeAs === 'program') {
        console.log('processing as program');
        establishInputFile(exportDef, definition, data._id, function(input, error) {
          if (error) {
            console.log('Failed to create input file');
            return callback(null, error);
          }

          var output = exportDef.outputDirectory + data._id + '.' + exportDef.outputExtension;
          var command = exportDef.invokePath.replace("{input}", input).replace("{output}", output);
          console.log('running: ' + command);
          exec(command, function (error, stdout, stderr) {
            if (error) {
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);
              repository.markAsError(data._id, function(data, error) {
                console.log('All done - error');
              });
            }
            else {
              fs.readFile(output, function(error, exportData){
                repository.markAsCompleted(data._id, exportData, exportDef.outputMIMEType, exportDef.outputExtension, function(data, error) {
                  console.log('All done - success');
                });
              });
            }
          });
          callback(callbackResult);
        });
      }
      else if (exportDef.invokeAs === 'function') {
        console.log('processing as inline function');
        var exportedResult = exportDef.fn(data.definition);
        if (exportedResult) {
          repository.markAsCompleted(data._id, exportedResult, exportDef.outputMIMEType, exportDef.outputExtension, function(data, error) {
            console.log('Marked as completed - success');
          });
          callback(callbackResult);
        }
        else {
          repository.markAsError(data._id, function(data, error) {
            console.log('All done - error');
            callback(null, error);
          });
        }
      }
    }
  });
}

