'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.unit', ['sophe.services.url', 'ngResource'])
.service('UnitService', ['$http', '$q', 'URLService', function($http, $q, URLService) {
  this.load = function() {
    var deferred = $q.defer();
    $http.get(URLService.getUnitServiceURL())
      .then(
        function(response) {
          var data = response.data;
          deferred.resolve(data);
        },
        function(response) {
          deferred.reject('There was an error: ' + response.status);
        }
      );
    return deferred.promise;
  };
  
  function _formatLabel(item) {
    return item.code.replace(/[\{\}\[\]]/g, ' ').trim();
  }
  
  this.processValues = function(data) {
    var units = [];
    var transformedData = [];
    for (var index = 0; index < data.length; index++) {
      transformedData.push({
        id: data[index].code,
        name: data[index].value,
        label: _formatLabel(data[index])
      });
    }

    units = transformedData.sort(ArrayUtil.sortByName);
    return units;
  };
}]);