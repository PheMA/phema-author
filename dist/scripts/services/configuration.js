'use strict';

// This service provides access to runtime (dynamic) configuration options that may be
// controlled externally.  It differes from sophe.config, which contains a list of
// constants set when the application is deployed.
angular.module('sophe.services.configuration', ['sophe.services.url', 'ngResource'])
.service('ConfigurationService', ['$http', '$q', 'URLService', function($http, $q, URLService) {
  this._load = function(url) {
    var deferred = $q.defer();
    $http.get(url)
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.load = function() {
    return this._load(URLService.getConfigServiceURL());
  };

  this.loadExporters = function() {
    return this._load(URLService.getConfigServiceURL('exporters'));
  };

  this.processExportersForMenu = function(data, exportFn) {
    var exporters = [];
    if (data) {
      for (var key in data) {
        exporters.push({
          id: key,
          text: data[key].name,
          tooltip: data[key].description,
          event: exportFn
        });
      }
    }

    return exporters;
  };
}]);