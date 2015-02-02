'use strict';

angular.module('sophe.elements.qdm.dataElements', [])
  .directive('qdmDataElements', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/qdm/dataElements.html',
    restrict: 'A',
    replace: true
  };
  return directive;
}]);