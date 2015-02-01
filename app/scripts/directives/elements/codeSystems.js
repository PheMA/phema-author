'use strict';

angular.module('sophe.elements.codeSystems', [])
  .directive('codeSystems', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: function(element, attrs) {
      if (attrs.location && attrs.location === 'sidebar') {
        return 'views/elements/codeSystem/sidebar.html';
      }
      else {
        return 'views/elements/codeSystem/multi.html';
      }
    },
    restrict: 'EA',
    controller: 'CodeSystemsController',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
    }
  };
  return directive;
}]);