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
        name: data[index].name,
        type: 'Phenotype'
      });
    }

    phenotypes = transformedData.sort(ArrayUtil.sortByName);
    return phenotypes;
  };
}]);