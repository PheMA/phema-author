'use strict';

/* globals ArrayUtil, Constants */

angular.module('sophe.services.library', ['sophe.services.url', 'ngResource'])
.service('LibraryService', ['$resource', '$q', 'URLService', 'security', function($resource, $q, URLService, security) {
  this.load = function() {
    var deferred = $q.defer();
    $resource(URLService.getLibraryURL()).query(function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  function _formatLastModified(item) {
    return (item.modified ? item.modified : (item.created ? item.created : '(Unknown)'));
  }

  function _formatDescription(item) {
    var description = item.description + '\r\n\r\nLast modified: ';
    description = description + _formatLastModified(item) + '\r\nLast modified by: ';
    description = description + (item.modifiedBy ? item.modifiedBy : '(Unknown)');
    return description;
  }

  this.processValues = function(data) {
    var phenotypes = [];
    var transformedData = [];
    for (var index = 0; index < data.length; index++) {
      transformedData.push({
        id: data[index].id,
        name: (data[index].name === undefined ? '(No name provided)' : data[index].name),
        description: _formatDescription(data[index]),
        type: Constants.ElementTypes.PHENOTYPE,
        lastModified: _formatLastModified(data[index])
      });
    }

    phenotypes = transformedData.sort(ArrayUtil.sortByName);
    return phenotypes;
  };

  this.loadDetails = function(id) {
    var deferred = $q.defer();
    $resource(URLService.getLibraryURL(true), {id:'@id'}).get({id: id}, function(data) {
      deferred.resolve(data);
    }, function(data, status) {
      deferred.reject('There was an error: ' + status);
    });
    return deferred.promise;
  };

  this.saveDetails = function(details) {
    if (security.currentUser)
    {
      if (!details.createdBy) { 
        details.createdBy = security.currentUser.email;
        details.modifiedBy = security.currentUser.email;
      }
      details.user = security.currentUser;
    }
    var deferred = $q.defer();
    var LibraryItem = $resource(URLService.getLibraryURL(true), {id:'@id'},
      {
          'update': { method:'PUT' }
      });
    var item = new LibraryItem(details);
    if (details.id && details.id !== '') {
      item.$update({ id: details.id }, function(data) {
        deferred.resolve(data);
      }, function() {
        deferred.reject('Unable to update the phenotype');
      });
    }
    else {
      item.$save(null, function(data) {
        deferred.resolve(data);
      }, function() {
        deferred.reject('Unable to save the phenotype');
      });
    }
    return deferred.promise;
  };
}]);
