'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.qdmElement', ['sophe.services.attribute', 'sophe.services.url', 'ngResource'])
.service('QDMElementService', ['$resource', '$q', 'AttributeService', 'URLService', function($resource, $q, AttributeService, URLService) {
  this.loadCategories = function() {
    var deferred = $q.defer();
    $resource(URLService.getDataServiceURL('categories')).get(function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.loadElements = function(categories) {
    var deferred = $q.defer();
    $resource(URLService.getDataServiceURL('elements')).get(function(data) {
      deferred.resolve({categories: categories, elements: data});
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.load = function() {
    return this.loadCategories().then(this.loadElements);
  };

  this.processValues = function(data) {
    var dataElements = [];
    var index = 0;
    if (data && data.categories && data.categories.results) {
      var transformedData = [];
      var originalCategoryData = data.categories.results.bindings;
      for (index = 0; index < originalCategoryData.length; index++) {
        transformedData.push({
          id: originalCategoryData[index].dataElementName.value,
          name: originalCategoryData[index].categoryLabel.value,
          description: originalCategoryData[index].definition.value,
          uri: originalCategoryData[index].id.value,
          type: 'Category',
          children: []} );
      }
      dataElements = transformedData.sort(ArrayUtil.sortByName);
    }

    if (data && data.elements && data.elements.results) {
      var originalElementData = data.elements.results.bindings;
      var categoryIndex = 0;
      for (index = 0; index < originalElementData.length; index++) {
        for (categoryIndex = 0; categoryIndex < dataElements.length; categoryIndex++) {
          if (dataElements[categoryIndex].uri === originalElementData[index].context.value) {
            dataElements[categoryIndex].children.push({
              id: originalElementData[index].dataElementName.value,
              name: originalElementData[index].dataElementLabel.value,
              description: originalElementData[index].definition.value,
              uri: originalElementData[index].id.value,
              type: 'DataElement'
            });
            break;
          }
        }
      }

      for (categoryIndex = 0; categoryIndex < dataElements.length; categoryIndex++) {
        dataElements[categoryIndex].children = dataElements[categoryIndex].children.sort(ArrayUtil.sortByName);
      }
    }
    return dataElements;
  };

  this.getAttributes = function(element) {
    var promise = null;
    if (element.type === 'Category') {
      promise = AttributeService.loadCategory(element.id)
        .then(AttributeService.processValues);
    }
    else if (element.type === 'DataElement') {
      promise = AttributeService.loadElement(element.id)
        .then(AttributeService.processValues);
    }

    return promise;
  };
}]);