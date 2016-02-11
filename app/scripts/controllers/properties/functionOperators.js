'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:FunctionPropertiesController
 * @description
 * # FunctionPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('FunctionOperatorPropertiesController', ['$scope', '$modalInstance', 'element', 'containedElements', 'attributes', function ($scope, $modalInstance, element, containedElements, attributes) {
    $scope.containedElements = containedElements;
    $scope.formData = attributes || {};
    $scope.functionName = element.name;
    $scope.containedElement = "(data element not yet defined)";

    if (containedElements) {
      switch (containedElements.length) {
        case 2:
          $scope.containedElement = containedElements[0].element().name  + ' and ' + containedElements[1].element().name;
          break;
        case 1:
          $scope.containedElement = containedElements[0].element().name;
          break;
      }
    }

    // There are standard attributes available to every data element that are implied.
    // We will explicitly define those here
    var template = [];
    template.push({ 'type': 'resultValue', 'label': 'Result should be', 'model': 'Value' });
    $scope.formTemplate = template;

    $scope.ok = function () {
      $modalInstance.close($scope.formData);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
