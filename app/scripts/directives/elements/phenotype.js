'use strict';

angular.module('sophe.elements.phenotype', [])
  .directive('phenotypeElements', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/phenotype.html',
    restrict: 'A',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
    }
  };
  return directive;
}]);