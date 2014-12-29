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
          name: originalData[index].logicalOperatorLabel.value,
          uri: originalData[index].id.value,
          type: 'LogicalOperator',
          children: []} );
      }
      logicalOperators = transformedData.sort(ArrayUtil.sortByName);
    }
    return logicalOperators;
  };
}]);