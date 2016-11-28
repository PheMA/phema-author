'use strict';
var request = require('request');
var CTS2Util = require('../lib/cts2/cts2Util').CTS2Util;

// Provides a simple wrapper around the CTS2 web service
// We wrap this so we can safely invoke from our client without having to
// worry about cross-domain requests.

var ValueSetRepository = function(baseURL) {
  console.log(baseURL);
  this.baseURL = baseURL;
  this.cts2Util = new CTS2Util(baseURL);
}

ValueSetRepository.prototype.getValueSets = function(callback) {
  request(this.baseURL + 'valuesets?format=json', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the list of value sets'});
    }
  });
}

ValueSetRepository.prototype.searchValueSets = function(search, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valuesets?matchvalue=' + search + '&format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      console.log(response);
      callback({message: 'Unable to search the list of value sets'});
    }
  });
}

ValueSetRepository.prototype.getValueSet = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valueset/' + id + '?format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value sets'});
    }
  });
}

ValueSetRepository.prototype.getValueSetMembers = function(id, callback) {
  request({rejectUnauthorized: false, url: this.baseURL + 'valueset/' + id + '/resolution?format=json'}, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(null, body);
    }
    else {
      console.log(error);
      callback({message: 'Unable to retrieve the value set members'});
    }
  });
}

// The CTS2 entry is the first "wrapper" around an actual value set definition.
// For more information on the PhEMA value set structure, see doc/cts2-notes.txt
function mapValueSetToCTS2Entry(data) {
  return {
    "valueset" : {
      "about": data['oid'],
      "formalName": data['name'],
      "valueSetName": data['oid'],
      "sourceAndRole": [
        {
          "source": {
            "uri": "http://www.projectphema.org/authoring-tool",
            "name" : "PhEMA Authoring Tool"
          },
          "role": {
            "uri": "http://purl.org/dc/elements/1.1/creator",
            "name": "creator"
          }
        }
      ]
    }
  };
}

// The CTS2 definition uses the entry (created first) and provides the details,
// including which code(s) are part of the value set.
// For more information on the PhEMA value set structure, see doc/cts2-notes.txt
function mapValueSetToCTS2Definition(data) {

}

ValueSetRepository.prototype.add = function(data, callback) {
  var util = this.cts2Util;
  util.createChangeSet(function(error, changeSet1) {
    if (error) { return callback(error); }
    var valueSet = mapValueSetToCTS2Entry(data);
    util.createValueSet(changeSet1, valueSet, function(error, vsResponse) {
      if (error) { return callback(error); }
      util.createChangeSet(function(error, changeSet2) {
        if (error) { return callback(error); }
        var valueSetDefinition = mapValueSetToCTS2Definition(data);
        util.createValueSetDefinition(changeSet2, valueSetDefinition, function(error, vsdResponse) {
          if (error) { return callback(error); }
        });
      });
    });
  });
  // request({rejectUnauthorized: true, url: this.baseURL + 'valueset/' + id + '/resolution?format=json'}, function(error, response, body) {
  //   if (!error && response.statusCode === 200) {
  //     callback(null, body);
  //   }
  //   else {
  //     console.log(error);
  //     callback({message: 'Unable to add the value set'});
  //   }
  // });
}

exports.ValueSetRepository = ValueSetRepository;