'use strict';

/* globals ArrayUtil, Constants, Conversion */

angular.module('sophe.services.subsetOperator', ['sophe.services.url', 'ngResource'])
.service('SubsetOperatorService', ['$resource', '$q', 'URLService', function($resource, $q, URLService) {
  this.load = function() {
    var deferred = $q.defer();
    $resource(URLService.getDataServiceURL('subsetOperators')).get(function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.processValues = function(data) {
    var subsetOperators = [];
    if (data && data.results) {
      var transformedData = [];
      var originalData = data.results.bindings;
      for (var index = 0; index < originalData.length; index++) {
        transformedData.push(Conversion.convertDERResponse(originalData[index], Constants.ElementTypes.SUBSET_OPERATOR));
      }
      subsetOperators = transformedData.sort(ArrayUtil.sortByName);
    }
    return subsetOperators;
  };
}]);