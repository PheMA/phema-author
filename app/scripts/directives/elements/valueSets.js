'use strict';

angular.module('sophe.elements.valueSets', [])
  .directive('valueSets', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: function(element, attrs) {
      if (attrs.allowSelect && attrs.allowSelect === 'single') {
        return 'views/elements/valueSet/single.html';
      }
      else if (attrs.location && attrs.location === 'sidebar') {
        return 'views/elements/valueSet/sidebar.html';
      }
      else {
        return 'views/elements/valueSet/multi.html';
      }
    },
    restrict: 'EA',
    controller: 'ValueSetsController',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
    }
  };
  return directive;
}]);