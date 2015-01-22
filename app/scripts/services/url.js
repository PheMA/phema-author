'use strict';

angular.module('sophe.services.url', ['sophe.config'])
.service('URLService', ['environment', 'dataServiceBaseUrl', 'libraryBaseUrl', 'valueSetServiceBaseUrl', function(environment, dataServiceBaseUrl, libraryBaseUrl, valueSetServiceBaseUrl) {
  this.getDataServiceURL = function(resource) {
    if (environment === 'local' || environment.substring(0, 2) === '@@') {
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

  this.getLibraryURL = function(details) {
    if (environment === 'local' || environment.substring(0, 2) === '@@') {
      if (details) {
        return 'data/phenotype.json';
      }
      else {
        return 'data/phenotypes.json';
      }
    }

    var url = libraryBaseUrl;
    if (details) {
      url = url + ':id';
    }
    return url;
  };

  this.getValueSetServiceURL = function(action, params) {
    if (environment === 'local' || environment.substring(0, 2) === '@@') {
      if (action === 'details') {
        return 'data/valueSet.json';
      }
      else {
        return 'data/valueSets.json';
      }
    }

    var url = valueSetServiceBaseUrl;
    if (action === 'details') {
      url = url + params.id + '?format=json';
    }
    else if (action === 'search') {
      url = url + '?matchvalue=\'' + params.term + '\'&format=json'
    }

    return url + '?format=json';
  };
}]);