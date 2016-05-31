'use strict';

/* globals ArrayUtil */

angular.module('sophe.services.library', ['sophe.services.url', 'ngResource'])
.service('LibraryService', ['$http','$resource', '$q', 'URLService', 'security', function($http, $resource, $q, URLService, security) {
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
        name: data[index].name,
        description: _formatDescription(data[index]),
        type: 'Phenotype',
        lastModified: _formatLastModified(data[index]),
        external: data[index].external,
        image: data[index].image
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
      details.createdBy = security.currentUser.email;
      // todo add whole user object 
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

  // Get the property options needed to save a phenotype to the library 
  this.properties = function() {
    var deferred = $q.defer();
    if (!security.currentUser) { 
      deferred.reject("You must be logged in.");
    }
    else {
      var session = security.currentUser.session;
      if (session) {
        var url = 'api/library-properties';
        var props = $resource(url).get({session:session}, function(data) {
          deferred.resolve(data);
        }, function(data, status) {
          deferred.reject('There was an getting phenotype properties: ' + status);
        });
      }
      else {
        deferred.reject('You must be logged in.');
      }
    }
    return deferred.promise;

  };
  // Get phenotype access type for user
  this.phenotype_access = function(library_id) {
    var deferred = $q.defer();
    if (!security.currentUser) { 
      deferred.reject("You must be logged in.");
    }
    else {
      var session = security.currentUser.session;
      if (session) {
        var url = '/api/phenotype-access';
        var props = $http.post(url,{user:security.currentUser, library_id: library_id}); 
        props.then( function(response) {
          console.log("library service phenotype access data: ", response.data);
          deferred.resolve(response.data);
        }, function(response) {
          deferred.reject('There was an getting phenotype access: ' + response);
        });
      }
      else {
        deferred.reject('You must be logged in.');
      }
    }
    return deferred.promise;

  };

}]);

