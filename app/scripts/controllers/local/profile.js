'use strict';

// We are assmuing that local/register.js is being loaded after us, so we create the 'security.local' module here.
angular.module('security.local', [])
.controller('ProfileFormController', ['$scope', '$location', 'UserService', 'security', function($scope, $location, UserService, security) {
  $scope.credentials = {
    email: security.currentUser.email,
    password: '',
    confirm_password: ''
  };
  $scope.id = security.currentUser.id;
  $scope.first_name = security.currentUser.firstName;
  $scope.last_name = security.currentUser.lastName;

  $scope.register = function (credentials) {
    $scope.authError = '';
    UserService.update(this.id, this.credentials.email, this.credentials.password, this.credentials.confirm_password, this.first_name, this.last_name, function(error, result){
      if (error) {
        $scope.authError = error;
      }
      else {
        var updatedUser = JSON.parse(JSON.stringify(security.currentUser));
        updatedUser.firstName = $scope.first_name;
        updatedUser.lastName = $scope.last_name;
        security.currentUser = updatedUser;
        $scope.cancel();
      }
    });
  };

  $scope.cancel = function() {
    $location.path("/");
  };
}]);