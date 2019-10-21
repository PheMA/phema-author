'use strict';

// We are assmuing that local/profile.js is being loaded before us, so we reference the 'security.local' module instead
// of creating a new one.
angular.module('security.local')
.controller('ForgotPasswordFormController', ['$scope', '$location', 'UserService', function($scope, $location, UserService) {
  $scope.email = '';

  $scope.reset = function (credentials) {
    $scope.resetError = '';
    $scope.resetSuccess = '';
    UserService.forgotPassword(this.email, function(error, result){
      if (error) {
        $scope.resetError = error;
      }
      else {
        $scope.resetSuccess = 'An e-mail has been sent with further instructions.  If you do not receive the e-mail, please check to see if it was marked as "Spam"';
      }
    });
  };

  $scope.cancel = function() {
    $location.path("/");
  };
}]);