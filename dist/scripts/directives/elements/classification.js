'use strict';

angular.module('sophe.elements.classification', [])
  .directive('classificationElements', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/classifications.html',
    restrict: 'A',
    replace: true
  };
  return directive;
}]);