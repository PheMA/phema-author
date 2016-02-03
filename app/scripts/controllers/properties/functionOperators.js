'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:FunctionPropertiesController
 * @description
 * # FunctionPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('FunctionOperatorPropertiesController', ['$scope', '$modalInstance', 'FunctionOperatorService', 'element', 'containedElements', 'functionOperators', function ($scope, $modalInstance, FunctionOperatorService, element, containedElements, functionOperators) {
    $scope.functionOperators = functionOperators;
    $scope.functionOperator = ArrayUtil.findInArray($scope.functionOperators, 'name', element.name);
    $scope.containedElements = containedElements;

    $scope.ok = function () {
      $modalInstance.close($scope.functionOperator);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
