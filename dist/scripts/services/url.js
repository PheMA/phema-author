'use strict';

angular.module('sophe.services.url', ['sophe.config'])
.service('URLService', ['environment', 'dataServiceBaseUrl', 'fhirServiceBaseUrl', 'libraryBaseUrl', 'valueSetServiceBaseUrl', 'codeSystemServiceBaseUrl', 'configServiceBaseUrl', 'exporterServiceBaseUrl', 'unitServiceBaseUrl',
    function(environment, dataServiceBaseUrl, fhirServiceBaseUrl, libraryBaseUrl, valueSetServiceBaseUrl, codeSystemServiceBaseUrl, configServiceBaseUrl, exporterServiceBaseUrl, unitServiceBaseUrl) {
  // Todo -- set environment variable 
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

  this.getFHIRServiceURL = function(resource) {
    if (environment === 'local' || environment.substring(0, 2) === '@@') {
      // For our local setup, we sometimes stub things in.  This isn't code we plan to
      // use in production, so it's okay if it's a little messy.
      if (/attributes/.test(resource)) {
        return 'data/fhir-attributes.json';
      }
      return 'data/fhir-' + resource + '.json';
    }

    var url = fhirServiceBaseUrl + resource;
    return url 
  };

  this.getLibraryURL = function(details) {
    
    /*if (false && environment === 'local' || environment.substring(0, 2) === '@@') {
      if (details) {
        return 'data/phenotype.json';
      }
      else {
        return 'data/phenotypes.json';
      }
    }
    */

    var url = "api/library/";//libraryBaseUrl;
    
    if (details) {
      url = url + ':id';
    }
    return url;
  };

  this.getValueSetServiceURL = function(action, params) {
    if (environment === 'local' || environment.substring(0, 2) === '@@') {
      if (action === 'single') {
        return 'data/valueSet.json';
      }
      else if (action === 'details') {
        return 'data/valueSet-members.json';
      }
      else {
        return 'data/valueSets.json';
      }
    }

    var url = valueSetServiceBaseUrl;
    if (action === 'single') {
      url = url + params.repoId + '/' + params.id;
    }
    else if (action === 'details') {
      url = url + params.repoId + '/' + params.id + '/members';
    }
    else if (action === 'search') {
      url = url + 'search=' + params.term;
    }

    return url;
  };

  this.getCodeSystemServiceURL = function(codeSystem, version, search) {
    if (environment === 'local' || environment.substring(0, 2) === '@@') {
      return 'data/codeSystem-search.json';
    }

    var url = codeSystemServiceBaseUrl + codeSystem + '/version/' + version + '/search=' + search;
    return url;
  };

  this.getConfigServiceURL = function(attribute) {
    if (environment === 'local' || environment.substring(0, 2) === '@@') {
      if (attribute === 'exporters') {
        return 'data/config-exporters.json';
      }
      return 'data/config.json';
    }

    var url = configServiceBaseUrl;
    if (attribute === 'exporters') {
      url = url + attribute;
    }
    return url;
  };

  this.getExporterServiceURL = function(action, params) {
    if (environment === 'local' || environment.substring(0, 2) === '@@') {
      if (action === 'run') {
        return 'data/exporter-run.json';
      }
      else if (action === 'result') {
        return 'data/exporter-result.json';
      }
      else {
        return 'data/exporter-status.json';
      }
    }

    var url = exporterServiceBaseUrl;
    if (action === 'run') {
      url = url + params.exporterKey;
    }
    else if (action === 'result') {
      url = url + params.exportId;
    }
    else if (action === 'status') {
      url = url + params.exportId + '/status';
    }

    return url;
  };
  
  this.getUnitServiceURL = function() {
    if (environment === 'local' || environment.substring(0, 2) === '@@') {
      return 'data/units.json';
    }

    var url = unitServiceBaseUrl;
    return url;
  };
}]);