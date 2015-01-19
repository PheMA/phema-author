'use strict';

angular.module('sophe.elements.qdm.temporalOperators', [])
  .directive('temporalOperators', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/qdm/temporalOperators.html',
    restrict: 'A',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
    }
  };
  return directive;
}]);