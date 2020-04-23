'use strict';

angular.module('sophe.elements.cql.elements', [])
  .directive('cqlElements', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/cql/elements.html',
    restrict: 'A',
    replace: true,
    scope: { data: '=' }
  };
  return directive;
}]);