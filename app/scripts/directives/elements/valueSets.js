'use strict';

angular.module('sophe.elements.valueSets', [])
  .directive('valueSets', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: function(element, attrs) {
      if (attrs.allowSelect && attrs.allowSelect === 'single') {
        return 'views/elements/valueSet.html';
      }
      else {
        return 'views/elements/valueSets.html';
      }
    },
    restrict: 'E',
    controller: 'ValueSetsController',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
    }
  };
  return directive;
}]);