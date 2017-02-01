'use strict';

/* globals ArrayUtil, Constants */

// Creates objects with the following attributes (and CTS2 mappings):
// id: The OID associated with the value set
//     CTS2: definedValueSet.content or currentDefinition.valueSet.content
// name: The formal name of the value set to be used for display
//     CTS2: formalName
// uri: The assigned URI for the value set
//     CTS2: documentURI or uri
// type: The type of object within the editor canvas
//     'ValueSet'
// loadDetailStatus: A control field to flag if we have loaded the details (to
//                avoid loading multiple times).
//     null | 'loaded' | 'error'
// description: Summarized information about the value set.  Generated by the app
//              once details are loaded.
// codeSystems: An array of code system(s) that are represented in the value set
//     CTS2: resolutionInfo.resolvedUsingCodeSystemList.codeSystem.content
// terms: A collection of the codes contained in the value set
//     Array of objects with the following definition:
//         codeSystem:
//             CTS2: namespace
//         id:
//             CTS2: name  (the code value)
//         name:
//             CTS2: designation
//         uri:
//             CTS2: uri
//         type:
//             'Term'
//
// NOTE: The VSMC service that wraps the VSAC is based on an older version of the
//   CTS2 framework than the cts2-vsd-service (which serves custom value sets).
//   Because there are differences in the JSON across these versions of the CTS2
//   framework, we need to process the results differently.  There are utility
//   functions that live outside the service which provide common processing
//   logic.  Within the service calls, it detects the version of the CTS2 framework
//   and prepares results to be processed.


function _processValueList(valueSetRepositoryId, originalData) {
  var valueSets = [];
  var transformedData = [];
  for (var index = 0; index < originalData.length; index++) {
    if (originalData[index].currentDefinition) {
      transformedData.push({
        id: originalData[index].currentDefinition.valueSet.content,
        valueSetRepository: valueSetRepositoryId,
        name: originalData[index].formalName,
        uri: originalData[index].currentDefinition.valueSetDefinition.uri,
        type: Constants.ElementTypes.VALUE_SET,
        loadDetailStatus: null,
        description: null,
        codeSystems: [],
        terms: []} );
    }
  }
  valueSets = transformedData.sort(ArrayUtil.sortByName);
  return valueSets;
}

function _getValueListAsChildren(valueSetRepositoryId, data) {
  if (data.valueSetCatalogEntryDirectory && data.valueSetCatalogEntryDirectory.entryList) {
    return _processValueList(valueSetRepositoryId, data.valueSetCatalogEntryDirectory.entryList);
  }
  else if (data.ValueSetCatalogEntryDirectory && data.ValueSetCatalogEntryDirectory.entry) {
    return _processValueList(valueSetRepositoryId, data.ValueSetCatalogEntryDirectory.entry);
  }

  return [];
}

function _processSingleValue(originalData) {
  var valueSet = null;
  valueSet = {
    id: originalData.currentDefinition.valueSet.content,
    name: originalData.formalName,
    uri: originalData.currentDefinition.valueSetDefinition.uri,
    type: Constants.ElementTypes.VALUE_SET,
    loadDetailStatus: null,
    description: null,
    codeSystems: [],
    terms: []
  };
  return valueSet;
}

function _processCodeSystemDetails(resolutionInfo) {
  var codeSystems = [];
  if (resolutionInfo && resolutionInfo.resolvedUsingCodeSystemList) {
    var codeSystemList = resolutionInfo.resolvedUsingCodeSystemList;
    for (var codeIndex = 0; codeIndex < codeSystemList.length; codeIndex++) {
      codeSystems.push(codeSystemList[codeIndex].codeSystem.content);
    }
  }
  return codeSystems;
}

function _processMemberDetails(originalData) {
  var terms = [];
  if (originalData) {
    for (var index = 0; index < originalData.length; index++) {
      terms.push({
        codeSystem: originalData[index].namespace,
        id: originalData[index].name,
        name: originalData[index].designation,
        uri: originalData[index].uri,
        type: 'Term'} );
    }
  }
  return terms;
}


angular.module('sophe.services.valueSet', ['sophe.services.url', 'ngResource'])
.service('ValueSetService', ['$http', '$q', 'URLService', 'ConfigurationService', function($http, $q, URLService, ConfigurationService) {
  this.load = function() {
    var deferred = $q.defer();
    $http.get(URLService.getValueSetServiceURL())
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.search = function(term) {
    var deferred = $q.defer();
    $http.get(URLService.getValueSetServiceURL('search', {term: term}))
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.loadSingle = function(repoId, id) {
    var deferred = $q.defer();
    $http.get(URLService.getValueSetServiceURL('single', {repoId: repoId, id: id}))
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.loadDetails = function(repoId, id) {
    var deferred = $q.defer();
    $http.get(URLService.getValueSetServiceURL('details', {repoId: repoId, id: id}))
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.save = function(repoId, valueSet) {
    var deferred = $q.defer();
    $http.post(URLService.getValueSetServiceURL('save', {repoId: repoId}), valueSet)
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.processValues = function(data) {
    var valueSets = [];
    if (data) {
      // Iterate over each attribute in data
      Object.keys(data).forEach(function(key) {
        if (!data[key].error) {
          valueSets.push({
            id: key,
            name: data[key].value.title,
            type: 'ValueSetRepository',
            children: _getValueListAsChildren(key, JSON.parse(data[key].value.data))
          });
        }
      });
    }
    return valueSets;
  };

  this.processSingleValue = function(data) {
    var valueSet = null;
    if (data) {
      if (data.valueSetDefinitionMsg && data.valueSetDefinitionMsg.valueSetDefinition) {
        valueSet = _processSingleValue(data.valueSetDefinitionMsg.valueSetDefinition);
      }
      else if (data.ValueSetDefinitionMsg && data.ValueSetDefinitionMsg.valueSetDefinition) {
        valueSet = _processSingleValue(data.ValueSetDefinitionMsg.valueSetDefinition);
      }
      else if (data.ValueSetCatalogEntryMsg && data.ValueSetCatalogEntryMsg.valueSetCatalogEntry) {
        valueSet = _processSingleValue(data.ValueSetCatalogEntryMsg.valueSetCatalogEntry);
      }
    }
    return valueSet;
  };

  this.processDetails = function(data) {
    var details = { codeSystems: [], terms: [] };
    if (data) {
      if (data.iteratableResolvedValueSet) {
        details.codeSystems = _processCodeSystemDetails(data.iteratableResolvedValueSet.resolutionInfo);
        details.terms = _processMemberDetails(data.iteratableResolvedValueSet.entryList);
      }
      else if (data.IteratableResolvedValueSet) {
        details.codeSystems = _processCodeSystemDetails(data.IteratableResolvedValueSet.resolutionInfo);
        details.terms = _processMemberDetails(data.IteratableResolvedValueSet.entry);
      }
    }
    return details;
  };

  this.searchHelper = function(search) {
    if (search.term === '') {
      search.isSearching = false;
      search.results = [];
    }
    else {
      search.isSearching = true;
      search.results = [];
      this.search(search.term)
        .then(this.processValues)
        .then(function(valueSets) {
          search.results = valueSets;
          search.isSearching = false;
        });
    }
  };

  // Helper function used to determine if the valueSet passed in is one that comes from an editable repository.
  // This relies on a callback function to signal when we have an answer (because we need to do some remote calls).
  // The callback will get either true or false depending on the result.  If we can't get all of the information
  // needed to determine if this comes from an editable repository, we assume it is not editable.
  this.isValueSetEditable = function(valueSet, callback) {
    ConfigurationService.load().then(function(config) {
      if (!config || !config.valueSetServices || !valueSet || !valueSet.valueSetRepository) {
        return callback(false);
      }

      for (var key in config.valueSetServices) {
        if (valueSet.valueSetRepository === key) {
          return callback(config.valueSetServices[key].writable);
        }
      }

      callback(false);
    });
  };

  this.formatDescription = function(valueSet) {
    // There are conditions where we haven't loaded yet, so we will return the default
    // 'Loading...' description
    if (!valueSet || !valueSet.loadDetailStatus) {
      return 'Loading...';
    }

    if (valueSet.loadDetailStatus === 'error') {
      return 'There was an error loading the details of this value set.  Please try again in a little bit, or contact us if the problem continues.';
    }

    if (!valueSet.terms || valueSet.terms.length === 0) {
      return '(There are no codes in this value set)';
    }

    var description = '';
    var index = 0;
    if (valueSet.codeSystems && valueSet.codeSystems.length > 0) {
      description = 'Code system(s) used: ';
      for (index = 0; index < valueSet.codeSystems.length; index++) {
        description += valueSet.codeSystems[index] + ', ';
      }
      description = description.substr(0, description.length - 2) + '\r\n';
    }

    description += 'Codes:';
    var lastCodeIndex = Math.min(3, valueSet.terms.length);
    if (valueSet.terms.length > lastCodeIndex) {
      description += ' (first ' + lastCodeIndex + ' of ' + valueSet.terms.length + ')';
    }
    description += '\r\n';

    for (index = 0; index < lastCodeIndex; index++) {
      description += ' (' + valueSet.terms[index].code + ') ' + valueSet.terms[index].name + '\r\n';
    }

    return description;
  };

  this.handleLoadDetails = function(valueSet, callback) {
    if (!callback) {
      return;
    }

    if (!valueSet) {
      callback(null);
    }

    if(!valueSet.loadDetailStatus) {
      this.loadDetails(valueSet.valueSetRepository, valueSet.id)
        .then(this.processDetails, function() {
          valueSet.loadDetailStatus = 'error';
          callback(valueSet);
          }
        )
        .then(function(details) {
          if (details) {
            valueSet.terms = details.terms;
            valueSet.codeSystems = details.codeSystems;
            valueSet.loadDetailStatus = 'success';
          }
          callback(valueSet);
        });
    }
    else {
      callback(valueSet);
    }
  };

  // Helper function to wrap some of the complexities of saving a value set entry.  This ensures it is
  // being routed to the right CTS2 service, and returns the value set as stored in the value set service.
  this.handleSave = function(valueSet, callback) {
    var vss = this;
    ConfigurationService.load().then(function(config) {
      var editableServiceId = 'phema';
      if (config && config.valueSetServices) {
        for (var key in config.valueSetServices) {
          if (config.valueSetServices[key].writable) {
            editableServiceId = key;
            break;
          }
        }
      }

      vss.save(editableServiceId, valueSet)
        .then(function(valueSet) {
          vss.loadSingle(editableServiceId, valueSet.id).then(vss.processSingleValue).then(function(valueSet){
            valueSet.valueSetRepository = editableServiceId;
            callback(valueSet);
          });
        });
    });
  };
}]);