'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.codeSystem', ['sophe.services.url', 'ngResource'])
.service('CodeSystemService', ['$http', '$q', 'URLService', function($http, $q, URLService) {
  // The list of code systems and versions that are supported for terminology searches
  this.supportedCodeSystems = [
    { codeSystem: 'ICD-9-CM', version: '2013_2012_08_06' },
    { codeSystem: 'ICD-10', version: '2010' },
    { codeSystem: 'LOINC', version: '246' }
  ];

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

  this._setupSearch = function(index, codeSystems, search) {
    var item = this.supportedCodeSystems[index];
    this.search(item.codeSystem, item.version, search.term)
      .then(this.processValues)
      .then(function(terms) {
        codeSystems.push({
          id: item.codeSystem,
          name: item.codeSystem + ' (' + terms.length + ' terms)',
          type: 'CodeSystem',
          children: terms});
        search.results = codeSystems;
        search.isSearching = false;
      });
  };

  this.searchHelper = function(search) {
    if (search.term === '') {
      search.isSearching = false;
      search.results = [];
    }
    else {
      search.isSearching = true;
      search.results = [];
      var codeSystems = [];
      for (var index = 0; index < this.supportedCodeSystems.length; index++) {
        this._setupSearch(index, codeSystems, search);
      }
    }
  };
}]);