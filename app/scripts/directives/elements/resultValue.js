'use strict';

angular.module('sophe.elements.resultValue', [])
  .directive('resultValue', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: function(element, attrs) {
      return 'views/elements/resultValue.html';
    },
    restrict: 'EA',
    controller: 'ResultValueController',
    replace: true,
    scope: { result: '=' }
  };
  return directive;
}]);