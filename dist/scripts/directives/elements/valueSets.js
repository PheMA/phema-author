'use strict';

angular.module('sophe.elements.valueSets', [])
  .directive('valueSets', ['$rootScope', function($rootScope) {
  var directive = {
    scope: {
      valueSet: '='
    },
    templateUrl: function(element, attrs) {
      if (attrs.allowSelect && attrs.allowSelect === 'single') {
        return 'views/elements/valueSet/single.html';
      }
      else if (attrs.location && attrs.location === 'sidebar') {
        return 'views/elements/valueSet/sidebar.html';
      }
      else if (attrs.location && attrs.location === 'input') {
        return 'views/elements/valueSet/input.html';
      }
      else {
        return 'views/elements/valueSet/multi.html';
      }
    },
    restrict: 'EA',
    controller: 'ValueSetsController',
    replace: true
  };
  return directive;
}]);