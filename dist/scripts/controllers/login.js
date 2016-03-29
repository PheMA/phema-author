'use strict';

angular.module('security.login.form', ['ngCookies'])

// The LoginFormController provides the behaviour behind a reusable form to allow users to authenticate.
// This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
.controller('LoginFormController', ['$scope', 'security','$location',  '$rootScope', '$cookies',function($scope, security, $location, $rootScope, $cookies) {
  // The model for this form 
  $scope.user = security.currentUser;

  // Any error message from failing to login
  $scope.authError = null;

  // The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
  // We could do something diffent for each reason here but to keep it simple...
  $scope.authReason = null;
  if ( security.getLoginReason() ) {
    $scope.authReason = ( security.isAuthenticated() ) ?
      'You are not authorized to access this page' :
      'Please log in to continue';
  }

  // Attempt to authenticate the user specified in the form's model
  $scope.login = function() {
    // Clear any previous security errors
    $scope.authError = null;

    // Try to login, sets the security.currentUser var
    security.login($scope.user.email, $scope.user.password).then(function(user) {
      
      if ( !security.isAuthenticated() ) {
        // If we get here then the login failed due to bad credentials
        $scope.authError = 'Invalid login or password';
      }
      else {
        security.closeLogin(true);
        //$scope.user = user;
        $rootScope.$broadcast('user:updated', user);
        console.log("Logged in user ", user);
        //$location("/");
      }
    }, function(err) {
      // If we get here then there was a problem with the login request to the server
      $scope.authError = err;
    });
  };

  $scope.clearForm = function() {
    $scope.user = {};
  };

  $scope.cancelLogin = function() {
    security.cancelLogin();
  };
}]);