'use strict';

angular.module('sophe.services.unit', ['sophe.services.url', 'ngResource'])
.service('UnitService', ['$http', '$q', 'URLService', function($http, $q, URLService) {
  this.load = function() {
    var deferred = $q.defer();
    $http.get(URLService.getUnitServiceURL())
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };
}]);