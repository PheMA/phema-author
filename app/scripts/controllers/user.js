'use strict';

angular.module('security.user', ['ngCookies'])


.controller('UserController', ['$scope', 'security', '$http', '$rootScope', '$cookies',function($scope, security, $http, $rootScope, $cookies) {
  // The model for this form 
  $scope.user = security.currentUser;
  console.log($scope.user);
  var session = $cookies['session']; 

  console.log('Session cookie : ', session);

    if ($scope.user)
    {


    var request = $http.post('/auth_user', {email: $scope.user.email});
    request.then(function(response) {
    
    $scope.user_data = response.data;
     });
  }
  
  

}]);