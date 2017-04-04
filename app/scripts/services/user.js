'use strict';

angular.module('sophe.services.user', ['sophe.services.url', 'ngResource'])
.service('UserService', ['$http', '$q', 'URLService', function($http, $q, URLService) {
  this.add = function(email, password, confirmPassword, firstName, lastName, callback) {
    $http.post(URLService.getUserServiceURL('add'), {email: email, password: password, confirmPassword: confirmPassword, firstName: firstName, lastName: lastName})
      .then(
        function(response) { callback(null, response.data); },
        function(response) { callback(response.data.message); });
  };

  this.update = function(id, email, password, confirmPassword, firstName, lastName, callback) {
    $http.put(URLService.getUserServiceURL('update', id), {email: email, password: password, confirmPassword: confirmPassword, firstName: firstName, lastName: lastName})
      .then(
        function(response) { callback(null, response.data); },
        function(response) { callback(response.data.message); });
  };
}]);