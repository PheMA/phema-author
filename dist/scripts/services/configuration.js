'use strict';

// This service provides access to runtime (dynamic) configuration options that may be
// controlled externally.  It differes from sophe.config, which contains a list of
// constants set when the application is deployed.
angular.module('sophe.services.configuration', ['sophe.services.url', 'ngResource'])
.service('ConfigurationService', ['$http', '$q', 'URLService', function($http, $q, URLService) {
  this._load = function(url, exportFn) {
    var deferred = $q.defer();
    $http.get(url)
      .success(function(data) {
        deferred.resolve({data: data, exportFn: exportFn});
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.load = function() {
    return this._load(URLService.getConfigServiceURL());
  };

  this.loadExporters = function(exportFn) {
    return this._load(URLService.getConfigServiceURL('exporters'), exportFn);
  };

  this.processExportersForMenu = function(data) {
    var exporters = [];
    var index = 0;
    if (data.data && data.data.length > 0) {
      for (index = 0; index < data.data.length; index++) {
        exporters.push({
          id: data.data[index].id,
          text: data.data[index].name,
          tooltip: data.data[index].description,
          event: data.exportFn
        });
      }
    }

    return exporters;
  };
}]);