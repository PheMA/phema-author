'use strict';

angular.module('sophe.factories.authInterceptor', [])
.factory('authInterceptorFactory', ['$rootScope', '$q', '$injector', function ($rootScope, $q, $injector) {
  return {
    request: function (config) {
      config.headers = config.headers || {};

      //injected manually to get around circular dependency problem.
      var security = $injector.get('security');
      if (security.token) {
        config.headers.Authorization = 'Bearer ' + security.token;
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401) {
        // handle the case where the user is not authenticated
      }
      return response || $q.when(response);
    }
  };
}]);