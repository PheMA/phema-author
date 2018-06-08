var request = require('request');
var CodeSystemRepository = require('../lib/codeSystems').CodeSystemRepository;
//lexevs62cts2.nci.nih.gov/lexevscts2/codesystem/ICD-9-CM/version/2013_2012_08_06/entities?q=253
var repository = new CodeSystemRepository(process.env.CODE_SYSTEM_SERVICE_URL);

exports.search = function(req, res){
  repository.searchCodeSystem(req.params.codesystem, req.params.version, req.params.search, function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};