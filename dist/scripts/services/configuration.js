'use strict';

// This service provides access to runtime (dynamic) configuration options that may be
// controlled externally.  It differes from sophe.config, which contains a list of
// constants set when the application is deployed.
angular.module('sophe.services.configuration', ['sophe.services.url', 'ngResource'])
.service('ConfigurationService', ['$http', '$q', '$timeout', 'URLService', function($http, $q, $timeout, URLService) {
  var _cachedData = null;

  this._load = function(url) {
    var deferred = $q.defer();
    if (_cachedData) {
      // Internally we will have a cached representation of the config data.  If we need to return that, because everything
      // is hooked up otherwise to get a promise and wait for it to be resolved, we wrap a $timeout call around it.  This
      // way everywhere we use the configuration service we can call ConfigurationService.load().then().
      $timeout(function() { deferred.resolve(_cachedData); }, 10);
      return deferred.promise;
    }
    else {
      $http.get(url)
        .success(function(data) {
          _cachedData = data;
          deferred.resolve(data);
        })
        .error(function(data, status) {
          deferred.reject('There was an error: ' + status);
        });
    }
    return deferred.promise;
  };

  this.load = function() {
    return this._load(URLService.getConfigServiceURL());
  };

  this.processExportersForMenu = function(data, exportFn) {
    var exporters = [];
    if (data && data.exporters) {
      for (var key in data.exporters) {
        exporters.push({
          id: key,
          text: data.exporters[key].name,
          tooltip: data.exporters[key].description,
          event: exportFn
        });
      }
    }

    return exporters;
  };
}]);