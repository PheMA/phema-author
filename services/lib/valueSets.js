'use strict';
var request = require('request');
const uuid = require('uuid');
var CTS2Util = require('../lib/cts2/cts2Util').CTS2Util;
var util = require('../lib/util');

// Provides a simple wrapper around the CTS2 web service
// We wrap this so we can safely invoke from our client without having to
// worry about cross-domain requests.

// baseURL - the base URL to the CTS2 endpoint, including the trailing slash
// baseOID - OPTIONAL - only used for writable repositories.  This is the base OID used when creating new value set entries.
var ValueSetRepository = function(baseURL, baseOID) {
  console.log(baseURL);
  this.baseURL = baseURL;
  this.cts2Util = new CTS2Util(baseURL);
  this.baseOID = baseOID;
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

function getCTS2TermList(data) {
  var terms = [];
  for (var index in data['terms']) {
    var term = data['terms'][index];
    terms.push({
      "uri": term['uri'],
      "namespace": term['codeSystem'],
      "name": term['id'],
      "designation": term['name']
    });
  }
  return terms;
}

// The CTS2 definition uses the entry (created first) and provides the details,
// including which code(s) are part of the value set.
// For more information on the PhEMA value set structure, see doc/cts2-notes.txt
function mapValueSetToCTS2Definition(data, existingVersion) {
  var oid = data['oid'];
  var version = (data['version'] ? data['version'] : uuid.v1());
  var versionTag = oid + '_' + version;
  var uri = oid + '_' + (existingVersion ? existingVersion : version);
  var definition = {
    "valueSetDefinition": {
      "definedValueSet": {
        "uri": "urn:oid:" + oid,
        "content": oid
      },
      "versionTag": [
        {
          "uri": version,
          "content": version
        }
      ],
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
      ],
      "entryState": "ACTIVE",
      "about": version,
      "documentURI": version,
      "entry": [
        {
          "operator" : "UNION",
          "entryOrder": 1,
          "entity": {
            "referencedEntity" : getCTS2TermList(data)
          }
        }
      ],
      "officialResourceVersionId": version,
      "resourceSynopsis": {
        "value": data['description']
      }
    }
  };
  return definition;
}

ValueSetRepository.prototype.add = function(data, callback) {
  // If there is no base OID, we cannot continue
  if (util.isEmptyString(this.baseOID)) {
    return callback({message: 'The value set repository is not set up to save entries'});
  }

  // If no OID is assigned already, we will specify one using the base OID and a random ID
  var oidBlank = util.isEmptyString(data['oid']);
  if (oidBlank) {
    data['oid'] = this.baseOID + '.' + uuid.v4().replace(/-/g, '');
  }

  var cts2Util = this.cts2Util;
  cts2Util.findValueSet(data['oid'], function(error, existingValueSet) {
    if (error) { return callback(error); }
    if (oidBlank && existingValueSet) { return callback({message: 'A conflicting value set definition was found'}) }
    if (existingValueSet) {
      var existingVersion = existingValueSet['ValueSetCatalogEntryMsg']['valueSetCatalogEntry']['currentDefinition']['valueSetDefinition']['content'].split('_')[1]
      data['version'] = existingVersion;
      console.log('Existing value set found: version=' + existingVersion);

      cts2Util.createChangeSet(function(error, changeSet) {
        if (error) { return callback(error); }
        var valueSetDefinition = mapValueSetToCTS2Definition(data, existingVersion);
        valueSetDefinition['valueSetDefinition']['changeDescription'] = { "changeType" : "UPDATE", "containingChangeSet" : changeSet };
        cts2Util.updateValueSetDefinition(data['oid'], existingVersion, changeSet, valueSetDefinition, function(error, vsdResponse) {
          if (error) { return callback(error); }
          callback(null, data);
        });
      });
    }
    else {
      cts2Util.createChangeSet(function(error, changeSet1) {
        if (error) { return callback(error); }
        var valueSet = mapValueSetToCTS2Entry(data);
        cts2Util.createValueSet(changeSet1, valueSet, function(error, vsResponse) {
          if (error) { return callback(error); }
          cts2Util.createChangeSet(function(error, changeSet2) {
            if (error) { return callback(error); }
            var valueSetDefinition = mapValueSetToCTS2Definition(data);
            cts2Util.createValueSetDefinition(changeSet2, valueSetDefinition, function(error, vsdResponse) {
              if (error) { return callback(error); }
              callback(null, data);
            });
          });
        });
      });
    }
  });
}

exports.ValueSetRepository = ValueSetRepository;