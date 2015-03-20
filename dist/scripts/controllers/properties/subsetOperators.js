'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:SubsetOperatorPropertiesController
 * @description
 * # SubsetOperatorPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('SubsetOperatorPropertiesController', ['$scope', '$modalInstance', 'SubsetOperatorService', 'element', 'containedElements', 'subsetOperators', function ($scope, $modalInstance, SubsetOperatorService, element, containedElements, subsetOperators) {
    $scope.subsetOperators = subsetOperators;
    $scope.subsetOperator = ArrayUtil.findInArray($scope.subsetOperators, 'name', element.name);
    $scope.containedElements = containedElements;

    $scope.ok = function () {
      $modalInstance.close($scope.subsetOperator);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
