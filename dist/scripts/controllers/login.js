'use strict';

angular.module('security.login.form', [])

// The LoginFormController provides the behaviour behind a reusable form to allow users to authenticate.
// This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
.controller('LoginFormController', ['$scope', 'security', function($scope, security) {
  $scope.credentials = {
    email: '',
    password: ''
  };

  $scope.login = function () {
    $scope.authError = '';
    security.login(this.credentials.email, this.credentials.password, function(error){
      $scope.authError = error;
    });
  };

  $scope.cancelLogin = function(suppressRedirect) {
    security.cancelLogin(suppressRedirect);
  };

  $scope.register = function(href) {
    security.cancelLoginWithRedirect(href);
  };
}]);