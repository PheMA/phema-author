'use strict';

angular.module('sophe.elements.qdm.subsetOperators', [])
  .directive('subsetOperators', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/qdm/subsetOperators.html',
    restrict: 'A',
    replace: true
  };
  return directive;
}]);