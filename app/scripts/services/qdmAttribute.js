'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.qdmAttribute', [])
.service('QDMAttributeService', ['$http', '$q', function($http, $q) {
  this._load = function(url) {
    var deferred = $q.defer();
    $http.get(url).success(function(data) {
      deferred.resolve(data);
    }).error (function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.loadAll = function() {
    return this._load('data/test-attribute_specificDatatype.json');
  };

  this.loadCategory = function(id) {
    return this._load('data/test-attribute_specificDatatype.json');
  };

  this.loadElement = function(id) {
    return this._load('data/test-attribute_specificDatatype.json');
  };

  this.processValues = function(data) {
    var attributes = [];
    if (data && data.results) {
      var transformedData = [];
      var originalData = data.results.bindings;
      for (var index = 0; index < originalData.length; index++) {
        transformedData.push({
          id: originalData[index].dataElementName.value,
          name: originalData[index].attributeLabel.value,
          uri: originalData[index].id.value,
          type: originalData[index].attributeLabel.datatype } );
      }
      attributes = transformedData;
    }
    return attributes;
  };

  this.translateQDMToForm = function(attribute) {
    var item = {
      "type": "text",
      "label": attribute.name,
      "model": attribute.id
    };

    if (attribute.id === 'Reason') {
      // Reasons use value sets
      item.type = 'select';
    }
    else if (attribute.type === 'http://www.w3.org/2001/XMLSchema#date') {
      item.type = 'date';
    }
    else if (attribute.type === 'http://www.w3.org/2001/XMLSchema#dateTime') {
      item.type = 'datetime';
    }

    return item;
  }
}]);