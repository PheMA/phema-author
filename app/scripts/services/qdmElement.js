'use strict';

/* globals ArrayUtil, Constants, Conversion */

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
        var newItem = Conversion.convertDERResponse(originalCategoryData[index], Constants.ElementTypes.CATEGORY);
        newItem.children = [];
        transformedData.push(newItem);
      }
      dataElements = transformedData.sort(ArrayUtil.sortByName);
    }

    if (data && data.elements && data.elements.results) {
      var originalElementData = data.elements.results.bindings;
      var categoryIndex = 0;
      for (index = 0; index < originalElementData.length; index++) {
        for (categoryIndex = 0; categoryIndex < dataElements.length; categoryIndex++) {
          if (dataElements[categoryIndex].uri === originalElementData[index].context.value) {
            dataElements[categoryIndex].children.push(
              Conversion.convertDERResponse(originalElementData[index], Constants.ElementTypes.DATA_ELEMENT));
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
    if (element.type === Constants.ElementTypes.CATEGORY) {
      promise = AttributeService.loadCategory(element.id)
        .then(AttributeService.processValues);
    }
    else if (element.type === Constants.ElementTypes.DATA_ELEMENT) {
      promise = AttributeService.loadElement(element.id)
        .then(AttributeService.processValues);
    }

    return promise;
  };
}]);