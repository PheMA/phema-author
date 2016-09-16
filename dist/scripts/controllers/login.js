'use strict';

angular.module('security.login.form', [])

// The LoginFormController provides the behaviour behind a reusable form to allow users to authenticate.
// This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
.controller('LoginFormController', ['$scope', 'security', function($scope, security) {
  $scope.credentials = {
    email: '',
    password: ''
  };

  $scope.login = function (credentials) {
    $scope.authError = '';
    security.login(this.credentials.email, this.credentials.password, function(error, loggedIn){
      $scope.authError = error;
    });
  };

  $scope.cancelLogin = function() {
    security.cancelLogin();
  };
}]);