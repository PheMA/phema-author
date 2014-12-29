'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.qdmElement', [])
.service('QDMElementService', ['$http', '$q', function($http, $q) {
  this.loadCategories = function() {
    var deferred = $q.defer();
    $http.get('data/qdm-categories.json').success(function(data) {
      deferred.resolve(data);
    }).error (function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.loadElements = function(categories) {
    var deferred = $q.defer();
    $http.get('data/qdm-elements.json').success(function(data) {
      deferred.resolve({categories: categories, elements: data});
    }).error (function(data, status) {
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
          name: originalCategoryData[index].categoryLabel.value,
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
              name: originalElementData[index].dataElementLabel.value,
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
}]);