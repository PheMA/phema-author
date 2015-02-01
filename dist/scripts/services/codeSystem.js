'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.codeSystem', ['sophe.services.url', 'ngResource'])
.service('CodeSystemService', ['$http', '$q', 'URLService', function($http, $q, URLService) {
  this.search = function(codeSystem, version, search) {
    var deferred = $q.defer();
    $http.get(URLService.getCodeSystemServiceURL(codeSystem, version, search))
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.processValues = function(data) {
    var codeSystems = [];
    if (data && data.EntityDirectory && data.EntityDirectory.entry) {
      var transformedData = [];
      var originalData = data.EntityDirectory.entry;
      for (var index = 0; index < originalData.length; index++) {
        transformedData.push({
          id: originalData[index].name.name,
          name: originalData[index].knownEntityDescription[0].designation,
          codeSystem: originalData[index].name.namespace,
          uri: originalData[index].about,
          type: 'Term'} );
      }
      codeSystems = transformedData.sort(ArrayUtil.sortByName);
    }
    return codeSystems;
  };
}]);