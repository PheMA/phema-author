'use strict';

exports.respondJSON = function(res, error, data) {
  if (error) {
    res.status(400).send(error);
  }
  else {
    res.set('Content-Type', 'application/json');
    res.status(200).send(data);
  }
};

exports.isEmptyString = function(value){
  return (value == null || value.length === 0);
};