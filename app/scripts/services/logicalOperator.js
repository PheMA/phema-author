'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.logicalOperator', [])
.service('LogicalOperatorService', ['$http', '$q', function($http, $q) {
  this.load = function() {
    var deferred = $q.defer();
    $http.get('data/qdm-logicalOperators.json').success(function(data) {
      deferred.resolve(data);
    }).error (function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.processValues = function(data) {
    var logicalOperators = [];
    if (data && data.results) {
      var transformedData = [];
      var originalData = data.results.bindings;
      for (var index = 0; index < originalData.length; index++) {
        transformedData.push({
          id: originalData[index].dataElementName.value,
          name: originalData[index].logicalOperatorLabel.value,
          uri: originalData[index].id.value,
          type: 'LogicalOperator',
          children: []} );
      }
      logicalOperators = transformedData.sort(ArrayUtil.sortByName);
    }
    return logicalOperators;
  };

  this.addDescriptionForProperties = function(operators) {
    var logicalOperatorDescriptions = [
      { uri: 'http://rdf.healthit.gov/qdm/element#And', description: 'All of the following criteria must be met'},
      { uri: 'http://rdf.healthit.gov/qdm/element#Or', description: 'One or more of the following criteria must be met'},
      { uri: 'http://rdf.healthit.gov/qdm/element#Not', description: 'None of the following criteria can be met'}
      ];
    for (var index = 0; index < operators.length; index++) {
      operators[index].description = ArrayUtil.findInArray(logicalOperatorDescriptions, 'uri', operators[index].uri).description;
    }
  };
}]);