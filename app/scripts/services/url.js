'use strict';

angular.module('sophe.services.url', ['sophe.config'])
.service('URLService', ['environment', 'dataServiceBaseUrl', function(environment, dataServiceBaseUrl) {
  this.getDataServiceURL = function(resource) {
    // environment = 'dev';
    // dataServiceBaseUrl = 'services/api/';
    if (environment === 'local' || environment === '@@environment') {
      // For our local setup, we sometimes stub things in.  This isn't code we plan to
      // use in production, so it's okay if it's a little messy.
      if (/attributes/.test(resource)) {
        return 'data/test-attribute_specificDatatype.json';
      }
      return 'data/qdm-' + resource + '.json';
    }

    var url = dataServiceBaseUrl + resource;
    return url;
  };

  this.getLibraryURL = function(resource) {
    if (environment === 'local' || environment === '@@environment') {
      return 'data/phenotypes.json';
    }

    var url = dataServiceBaseUrl + resource;
    return url;
  };
}]);