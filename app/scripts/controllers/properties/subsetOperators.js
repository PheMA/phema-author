'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:SubsetOperatorPropertiesController
 * @description
 * # SubsetOperatorPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('SubsetOperatorPropertiesController', ['$scope', '$uibModalInstance', 'SubsetOperatorService', 'element', 'containedElements', 'subsetOperators', function ($scope, $uibModalInstance, SubsetOperatorService, element, containedElements, subsetOperators) {
    $scope.subsetOperators = subsetOperators;
    $scope.subsetOperator = ArrayUtil.findInArray($scope.subsetOperators, 'name', element.name);
    $scope.containedElements = containedElements;

    $scope.ok = function () {
      $uibModalInstance.close($scope.subsetOperator);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }]);
