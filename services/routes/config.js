var request = require('request');

var configuration = {
  exporters: [
    {name: "HQMF", description: "HL7 Health Quality Measure Format (HQMF)"},
    {name: "PhEMA (JSON)", description: "Native format created by the authoring tool"},
    {name: "KNIME", description: "Creates an executable KNIME workflow"}
  ]
};

exports.index = function(req, res){
  res.set('Content-Type', 'application/json');
  res.status(200).send(configuration);
};

/**
 * Returns the information for all configured exporters
 * @param {Object} req HTTP request object.
 * @param {Object} res HTTP response object.
 */
exports.exporters = function(req, res){
  res.set('Content-Type', 'application/json');
  res.status(200).send(configuration.exporters);
};