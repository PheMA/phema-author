'use strict';

angular.module('sophe.elements.qdm', [])
  .directive('qdmElements', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/qdm.html',
    restrict: 'E',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
    }
  };
  return directive;
}]);