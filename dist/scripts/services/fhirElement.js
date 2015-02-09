'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.fhirElement', ['sophe.services.url', 'ngResource'])
.service('FHIRElementService', ['$resource', '$q', 'URLService', function($resource, $q, URLService) {
  this.load = function() {
    var deferred = $q.defer();
    $resource(URLService.getFHIRServiceURL('elements')).get(function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.processValues = function(data) {
    var dataElements = [];
    var index = 0;
    if (data && data.results) {
      var transformedData = [];
      var originalData = data.results.bindings;
      for (index = 0; index < originalData.length; index++) {
        transformedData.push({
          id: originalData[index].dataElementName.value,
          name: originalData[index].dataElementLabel.value,
          description: originalData[index].definition.value,
          uri: originalData[index].id.value,
          type: 'DataElement'} );
      }
      dataElements = transformedData.sort(ArrayUtil.sortByName);
    }

    return dataElements;
  };
}]);