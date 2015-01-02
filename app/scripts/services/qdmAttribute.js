'use strict';

angular.module('sophe.services.qdmAttribute', ['sophe.services.url', 'ngResource'])
.service('QDMAttributeService', ['URLService', '$resource', '$q', function(URLService, $resource, $q) {
  this._load = function(url, parameters) {
    var deferred = $q.defer();
    $resource(url).get(parameters, function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.loadAll = function() {
    return this._load(URLService.getDataServiceURL('attributes'));
  };

  this.loadCategory = function(id) {
    return this._load(URLService.getDataServiceURL('category/:category/attributes'), {category: id});
  };

  this.loadElement = function(id) {
    return this._load(URLService.getDataServiceURL('dataElement/:dataElement/attributes'), {dataElement: id});
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
      'type': 'text',
      'label': attribute.name,
      'model': attribute.id
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
  };
}]);