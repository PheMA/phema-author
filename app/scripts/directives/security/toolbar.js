var mod = angular.module('security.login.toolbar', []);

// The loginToolbar directive is a reusable widget that can show login or logout buttons
// and information the current authenticated user

// Peter -- this directive isn't used currently. I just put the templated in the index.html
// and use the controller below.  If we need this in more than one place we can use it. 
mod.directive('loginToolbar', ['security', function(security) {
  var directive = {
    templateUrl: 'views/security/toolbar.html',
    restrict: 'E',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
      $scope.isAuthenticated = security.isAuthenticated;
      $scope.login = security.showLogin;
      $scope.logout = security.logout;
      $scope.register = security.showRegister;
      $scope.security = security;
      $scope.user = security.currentUser;
      $scope.testvar = "TestVar";
      $scope.$watch(function() {
        return security.currentUser;
      }, function(currentUser) {
        $scope.user = currentUser;
      });
      $scope.$on('user:updated', function(event,data) {
     // you could inspect the data to see if what you care about changed, or just update your own scope
        $scope.user = data;
      });
       // different event names let you group your code and logic by what happened
      $scope.$on('user:logout', function(event,data) {
        $scope.user = null;
      });
    }
  };
  return directive;
}]);

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

