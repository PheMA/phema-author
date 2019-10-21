'use strict';

// We are assmuing that local/profile.js is being loaded before us, so we reference the 'security.local' module instead
// of creating a new one.
angular.module('security.local')
.controller('ResetPasswordFormController', ['$scope', '$location', '$routeParams', 'UserService', function($scope, $location, $routeParams, UserService) {
  $scope.email = 'test@test.com';
  $scope.token = $routeParams.token;

  $scope.reset = function (credentials) {
    $scope.resetError = '';
    $scope.resetSuccess = '';
    UserService.resetPassword(this.email, this.password, this.confirm_password, this.token, function(error, result){
      if (error) {
        $scope.resetError = error;
      }
      else {
        $location.path("/login");
      }
    });
  };

  $scope.cancel = function() {
    $location.path("/");
  };
}]);