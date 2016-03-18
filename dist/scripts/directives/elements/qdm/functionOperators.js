'use strict';

angular.module('sophe.elements.qdm.functionOperators', [])
  .directive('functionOperators', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/qdm/functionOperators.html',
    restrict: 'A',
    replace: true
  };
  return directive;
}]);