'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:LogicalOperatorPropertiesController
 * @description
 * # LogicalOperatorPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('LogicalOperatorPropertiesController', ['$scope', '$modalInstance', 'LogicalOperatorService', 'element', 'containedElements', 'logicalOperators', function ($scope, $modalInstance, LogicalOperatorService, element, containedElements, logicalOperators) {
    $scope.logicalOperators = logicalOperators;
    LogicalOperatorService.addDescriptionForProperties($scope.logicalOperators);
    $scope.logicalOperator = ArrayUtil.findInArray($scope.logicalOperators, 'name', element.name);
    $scope.containedElements = containedElements;

    $scope.ok = function () {
      $modalInstance.close($scope.logicalOperator);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
