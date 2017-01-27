'use strict';

angular.module('sophe.services.exporter', ['sophe.services.url', 'ngResource'])
.service('ExporterService', ['$http', '$q', 'URLService', function($http, $q, URLService) {
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

  this._post = function(url, data) {
    var deferred = $q.defer();
    $http.post(url, data)
      .success(function(data) {
        deferred.resolve(data);
      })
      .error(function(data, status) {
        deferred.reject('There was an error: ' + status);
      });
    return deferred.promise;
  };

  this.run = function(exporterKey, phenotype) {
    return this._post(URLService.getExporterServiceURL('run', {exporterKey: exporterKey}), {definition: phenotype});
  };

  this.getStatus = function(exportId) {
    return this._load(URLService.getExporterServiceURL('status', {exportId: exportId}));
  };

  this.getResult = function(exportId) {
    return this._load(URLService.getExporterServiceURL('result', {exportId: exportId}));
  };

  function minimizeJson(originalJson) {
    var minimizedJson = originalJson;
    var index;
    for (var key in minimizedJson) {
      if (!minimizedJson.hasOwnProperty(key)) {
        continue;
      }

      if (key === 'attrs') {
        minimizedJson[key] = minimizeJson(minimizedJson[key]);
      }
      else if (key === 'children') {
        for (index = 0; index < minimizedJson[key].length; index++) {
          minimizedJson[key][index] = minimizeJson(minimizedJson[key][index]);
        }
      }
      else if (key === 'element') {
        if (minimizedJson[key].hasOwnProperty('terms')) {
          delete minimizedJson[key].terms;
        }
      }
      // This is the whitelist of keys we will export
      else if (key !== 'phemaObject' && key !== 'valueSet' && key !== 'className' && key !== 'connections' && key !== 'connectors') {
        minimizedJson[key] = null;
        delete minimizedJson[key];
      }
    }

    return minimizedJson;
  }

  this.minimizeJsonFormat = function(originalJson) {
    return minimizeJson(JSON.parse(originalJson));
  };
}]);