'use strict';

/* globals ArrayUtil, Constants, Conversion */

const CQLElementWhitelist = [
  //{ id: 'CQL_10002', title: 'Types', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  { id: 'CQL_10003', title: 'Logical Operators', type: Constants.ElementTypes.LOGICAL_OPERATOR },
  //{ id: 'CQL_10004', title: 'Type Operators', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  { id: 'CQL_10005', title: 'Nullological Operators', type: Constants.ElementTypes.LOGICAL_OPERATOR },
  //{ id: 'CQL_10006', title: 'Comparison Operators', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  //{ id: 'CQL_10007', title: 'Arithmetic Operators', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  //{ id: 'CQL_10008', title: 'String Operators', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  //{ id: 'CQL_10009', title: 'Date/Time Operators', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  { id: 'CQL_10010', title: 'Interval Operators', type: Constants.ElementTypes.TEMPORAL_OPERATOR },
  { id: 'CQL_10011', title: 'List Operators', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  { id: 'CQL_10012', title: 'Aggregate Functions', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  //{ id: 'CQL_10013', title: 'Clinical Operators', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  //{ id: 'CQL_10014', title: 'Errors and Messaging', type: Constants.ElementTypes.FUNCTION_OPERATOR },
  //{ id: 'CQL_10015', title: 'Clinical Values', type: Constants.ElementTypes.FUNCTION_OPERATOR },
];


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
      dataElements = transformedData.filter(x => x != null).sort(ArrayUtil.sortByName);
    }

    return dataElements;
  }

  this.processValues = function(data) {
    return resultProcessor(data, function(original) {
      var convertedData = Conversion.convertDERResponse(original, Constants.ElementTypes.CATEGORY);
      convertedData.name = convertedData.name.replace(/^CQL\s/, '');
      convertedData.id = convertedData.id.replace(/^.*#/, '');  // Strip the URL prefix, we just want the ID portion

      var filter = CQLElementWhitelist.filter(el => el.id === convertedData.id);
      return (filter !== null && filter.length > 0) ? convertedData : null;
    });
  };

  this.expandTypes = function(types) {
    let index = 0;
    var promises = [];
    for (index = 0; index < types.length; index++) {
      const typeId = types[index].id;
      const promise = $resource(URLService.getCQLServiceURL('datatype', {id: typeId})).get().$promise.then(function(data) {
          const results = resultProcessor(data, function(original) {
            var filter = CQLElementWhitelist.filter(el => el.id === typeId);
            let elementType = Constants.ElementTypes.CATEGORY;
            if (filter !== null && filter.length > 0) {
              elementType = filter[0].type;
            }
            var convertedData = Conversion.convertDERResponse(original, elementType);
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