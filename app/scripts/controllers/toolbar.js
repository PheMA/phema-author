'use strict';

var mod = angular.module('toolbar', []);

mod.controller('ToolbarController', ['$scope', 'security', function($scope,security) {
  $scope.isAuthenticated = security.isAuthenticated;
  $scope.login = security.showLogin;
  $scope.logout = security.logout;
  $scope.register = security.showRegister;
  $scope.security = security;
  $scope.user = security.currentUser;
  
  // Update changes made to user in the view 
  $scope.$on('user:updated', function(event,data) {
    $scope.user = data;
  });
   // different event names let you group your code and logic by what happened
  $scope.$on('user:logout', function(event,data) {
    $scope.user = null;
  });
}]);

