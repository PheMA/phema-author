'use strict';

/* globals ArrayUtil */

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
        transformedData.push({
          id: originalData[index].dataElementName.value,
          name: originalData[index].dataElementLabel.value,
          description: originalData[index].definition.value,
          uri: originalData[index].id.value,
          type: 'FunctionOperator',
          children: []} );
      }
      functions = transformedData.sort(ArrayUtil.sortByName);
    }
    return functions;
  };
}]);