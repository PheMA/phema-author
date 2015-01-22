'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.valueSet', ['sophe.services.url', 'ngResource'])
.service('ValueSetService', ['$http', '$q', 'URLService', function($http, $q, URLService) {
  this.load = function() {
    var deferred = $q.defer();
    $http.get(URLService.getValueSetServiceURL())
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.search = function(term) {
    var deferred = $q.defer();
    $http.get(URLService.getValueSetServiceURL('search', {term: term}))
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.loadDetails = function(id) {
    var deferred = $q.defer();
    $http.get(URLService.getValueSetServiceURL('details', {id: id}))
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.processValues = function(data) {
    var valueSets = [];
    if (data && data.valueSetCatalogEntryDirectory && data.valueSetCatalogEntryDirectory.entryList) {
      var transformedData = [];
      var originalData = data.valueSetCatalogEntryDirectory.entryList;
      for (var index = 0; index < originalData.length; index++) {
        transformedData.push({
          id: originalData[index].currentDefinition.valueSet.content,
          name: originalData[index].formalName,
          uri: originalData[index].currentDefinition.valueSetDefinition.uri,
          type: 'ValueSet'} );
      }
      valueSets = transformedData.sort(ArrayUtil.sortByName);
    }
    return valueSets;
  };

  this.processSingleValue = function(data) {
    var valueSet = null;
    if (data && data.valueSetDefinitionMsg && data.valueSetDefinitionMsg.valueSetDefinition) {
      var originalData = data.valueSetDefinitionMsg.valueSetDefinition;
      valueSet = {
        id: originalData.definedValueSet.content,
        name: originalData.formalName,
        uri: originalData.documentURI,
        type: 'ValueSet'
      };
    }
    return valueSet;
  };
}]);