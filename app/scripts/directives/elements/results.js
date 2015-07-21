'use strict';

angular.module('sophe.elements.results', [])
  .directive('results', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: function(element, attrs) {
      return 'views/elements/result.html';
    },
    restrict: 'EA',
    controller: 'ResultsController',
    replace: true,
    scope: {result: '='}
  };
  return directive;
}]);