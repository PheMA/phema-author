'use strict';

/* globals ArrayUtil, Constants, CqlElementMap, Conversion */

angular.module('sophe.services.cqlElement', ['sophe.services.attribute', 'sophe.services.url', 'ngResource'])
.service('CQLElementService', ['$resource', '$q', 'AttributeService', 'URLService', function($resource, $q, AttributeService, URLService) {
  this.load = function() {
    var deferred = $q.defer();
    $resource(URLService.getCQLServiceURL('datatypes')).get(function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  function resultProcessor(data, conversionFn) {
    var dataElements = [];
    var index = 0;
    if (data && data.results) {
      var transformedData = [];
      var originalData = data.results.bindings;
      for (index = 0; index < originalData.length; index++) {
        var convertedData = conversionFn(originalData[index]);
        transformedData.push(convertedData);
      }
      dataElements = transformedData.sort(ArrayUtil.sortByName);
    }

    return dataElements;
  }

  this.processValues = function(data) {
    return resultProcessor(data, function(original) {
      var convertedData = Conversion.convertDERResponse(original, Constants.ElementTypes.DATA_ELEMENT);
      convertedData.name = convertedData.name.replace(/^CQL\s/, '');
      convertedData.id = convertedData.id.replace(/^.*#/, '');  // Strip the URL prefix, we just want the ID portion
      return convertedData;
    });
  };

  this.expandTypes = function(types) {
    let index = 0;
    var promises = [];
    for (index = 0; index < types.length; index++) {
      const typeId = types[index].id;
      const promise = $resource(URLService.getCQLServiceURL('datatype', {id: typeId})).get().$promise.then(function(data) {
          const results = resultProcessor(data, function(original) {
            var tmp = CqlElementMap[typeId];
            var convertedData = Conversion.convertDERResponse(original, Constants.ElementTypes.DATA_ELEMENT);
            convertedData.id = convertedData.uri.replace(/^.*#/, '');  // Strip the URL prefix, we just want the ID portion
            return convertedData;
          });
          return {typeId: typeId, data: results};
      });
      promises.push(promise);
    }
    return promises;
  };

  this.getAttributes = function() { //(element) {
    return null;
  };
}]);