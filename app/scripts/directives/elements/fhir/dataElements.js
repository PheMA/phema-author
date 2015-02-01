'use strict';

angular.module('sophe.elements.fhir.dataElements', [])
  .directive('fhirDataElements', ['$rootScope', function($rootScope) {
  var directive = {
    templateUrl: 'views/elements/fhir/dataElements.html',
    restrict: 'A',
    replace: true,
    scope: true
  };
  return directive;
}]);