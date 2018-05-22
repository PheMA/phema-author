'use strict';

angular.module('security.register.phekb', ['ngCookies'])

// The LoginFormController provides the behaviour behind a reusable form to allow users to authenticate.
// This controller and its template (login/form.tpl.html) are used in a modal dialog box by the security service.
.controller('RegisterController', ['$scope', 'security', '$http', '$rootScope', '$cookies',function($scope, security, $http, $rootScope, $cookies) {
  // The model for this form
  $scope.user = {};

  // Any error message from failing to login
  $scope.authError = null;

  // The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
  // We could do something diffent for each reason here but to keep it simple...
  /*$scope.authReason = null;
  if ( security.getLoginReason() ) {
    $scope.authReason = ( security.isAuthenticated() ) ?
      'You are not authorized to access this page' :
      'Please log in to continue';
  }
  */
  $scope.user.email = 'peter@gmail.com';
  $scope.user.password = 'peter'

  // Attempt to authenticate the user specified in the form's model
  this.register = function() {
    // Clear any previous security errors
    $scope.authError = null;

    // Try to Register. This sets the user
    var user_data = {email: $scope.user.email, password: $scope.user.password, firstName: $scope.user.firstName, lastName: $scope.user.lastName};
    var request = $http.post('/register', user_data);
    return request.then(function(response) {
    //security.register($scope.user.email, $scope.user.password).then(function(registration) {
     // console.log("in registration  callback ")
     // console.log(response);
      var data = response.data;
      if ( data.error ) {
        // If we get here then the login failed due to bad credentials
        console.log(response.error)
        $scope.authError = 'Registration Failed: ' + data.error + '. Please try again.';
        $scope.user.email = '';
        $scope.user.password = '';
        return null;
      }
      else
      {
        // all good
        $scope.authError = null;
        security.currentUser = data.user;
        security.closeRegister(true);
        $rootScope.$broadcast('user:updated', data.user);
        //console.log("Registered user ", $scope.user);
        return security.currentUser;
      }
    });
  };

  this.clearForm = function() {
    $scope.user = {};
  };

  this.cancel = function() {
    security.closeRegister(true);
  };
}]);
