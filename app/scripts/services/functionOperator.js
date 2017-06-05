'use strict';

/* globals ArrayUtil, Constants, Conversion */

angular.module('sophe.services.functionOperator', ['sophe.services.url', 'ngResource'])
.service('FunctionOperatorService', ['$resource', '$q', 'URLService', function($resource, $q, URLService) {
  this.load = function() {
    var deferred = $q.defer();
    $resource(URLService.getDataServiceURL('functions')).get(function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.processValues = function(data) {
    var functions = [];
    if (data && data.results) {
      var transformedData = [];
      var originalData = data.results.bindings;
      for (var index = 0; index < originalData.length; index++) {
        transformedData.push(Conversion.convertDERResponse(originalData[index], Constants.ElementTypes.FUNCTION_OPERATOR));
      }
      functions = transformedData.sort(ArrayUtil.sortByName);
    }
    return functions;
  };
}]);