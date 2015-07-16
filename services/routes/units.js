var request = require('request');

exports.index = function(req, res){
  repository.getUnits(function(error, data) {
    if (error) {
      res.status(400).send(error);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(data);
    }
  });
};