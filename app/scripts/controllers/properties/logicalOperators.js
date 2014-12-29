'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:LogicalOperatorPropertiesCtrl
 * @description
 * # RelationshipPropertiesCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('LogicalOperatorPropertiesCtrl', function ($scope, $modalInstance, LogicalOperatorService, element, containedElements, logicalOperators) {
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
  });
