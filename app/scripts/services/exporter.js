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

  this.run = function(exporterKey) {
    return this._load(URLService.getExporterServiceURL('run', {exporterKey: exporterKey}));
  };

  this.getStatus = function(exportId) {
    return this._load(URLService.getExporterServiceURL('status', {exportId: exportId}));
  };

  this.getResult = function(exportId) {
    return this._load(URLService.getExporterServiceURL('result', {exportId: exportId}));
  };
}]);