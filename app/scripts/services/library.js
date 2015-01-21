'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.library', ['sophe.services.url', 'ngResource'])
.service('LibraryService', ['$resource', '$q', 'URLService', function($resource, $q, URLService) {
  this.load = function() {
    var deferred = $q.defer();
    $resource(URLService.getLibraryURL()).query(function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.processValues = function(data) {
    var phenotypes = [];
    var transformedData = [];
    for (var index = 0; index < data.length; index++) {
      transformedData.push({
        id: data[index].id,
        name: data[index].name,
        description: data[index].description,
        type: 'Phenotype'
      });
    }

    phenotypes = transformedData.sort(ArrayUtil.sortByName);
    return phenotypes;
  };

  this.loadDetails = function(id) {
    var deferred = $q.defer();
    $resource(URLService.getLibraryURL(true), {id:'@id'}).get({id: id}, function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.saveDetails = function(details) {
    var deferred = $q.defer();
    var LibraryItem = $resource(URLService.getLibraryURL(true), {id:'@id'},
      {
          'update': { method:'PUT' }
      });
    var item = new LibraryItem(details);
    if (details.id && details.id !== '') {
      item.$update({ id: details.id }, function(data) {
        deferred.resolve(data);
      });
    }
    else {
      item.$save(null, function(data) {
        deferred.resolve(data);
      });
    }
    return deferred.promise;
  };
}]);