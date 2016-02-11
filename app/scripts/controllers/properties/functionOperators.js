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

    if (containedElements && containedElements.length > 0) {
      $scope.containedElement = containedElements[0].element().name;
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
