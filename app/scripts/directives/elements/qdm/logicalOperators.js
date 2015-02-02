'use strict';

angular.module('sophe.elements.qdm.logicalOperators', [])
  .directive('logicalOperators', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/qdm/logicalOperators.html',
    restrict: 'A',
    replace: true
  };
  return directive;
}]);