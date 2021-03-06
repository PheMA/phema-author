'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:RelationshipPropertiesController
 * @description
 * # RelationshipPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('RelationshipPropertiesController', ['$scope', '$uibModalInstance', 'TemporalOperatorService', 'element', 'temporalOperators', 'startLabel', 'endLabel', function ($scope, $uibModalInstance, TemporalOperatorService, element, temporalOperators, startLabel, endLabel) {
    $scope.startLabel = startLabel;
    $scope.endLabel = endLabel;
    $scope.element = element;
    $scope.relationship = {
      relationship: {base: '', modifier: '', value: element.uri},
      timeRange: {
        comparison: '',
        start: { value: '', units: '' },
        end: { value: '', units: '' }
      }
    };

    // Unit values based on UCUM specification
    $scope.units = [
      { name: 'minutes', value: 'm' },
      { name: 'hours', value: 'h' },
      { name: 'days', value: 'd' },
      { name: 'weeks', value: 'wk' },
      { name: 'months', value: 'mo' },
      { name: 'years', value: 'a' }
    ];

    $scope.comparisons = [
      { name: 'at any time', showStartTime: false, showEndTime: false },
      { name: 'between', showStartTime: true, showEndTime: true },
      { name: 'exactly', showStartTime: true, showEndTime: false },
      { name: '>=', showStartTime: true, showEndTime: false },
      { name: '>', showStartTime: true, showEndTime: false },
      { name: '<=', showStartTime: true, showEndTime: false },
      { name: '<', showStartTime: true, showEndTime: false },
    ]

    $scope.relationships = TemporalOperatorService.buildRelationshipListForProperties(temporalOperators);

    var elementData = TemporalOperatorService.convertQDMToSoPhe(element.uri, temporalOperators);
    if (elementData != null) {
      $scope.relationship.relationship.base = ArrayUtil.findInArray($scope.relationships, 'id', elementData.base);
      $scope.relationship.relationship.modifier = ArrayUtil.findInArray($scope.relationship.relationship.base.modifiers, 'label', elementData.modifier);
    }

    if (element.timeRange) {
      $scope.relationship.timeRange = element.timeRange;
      $scope.relationship.timeRange.comparison = ArrayUtil.findInArray($scope.comparisons, 'name', element.timeRange.comparison);
    }

    $scope.ok = function () {
      $uibModalInstance.close($scope.relationship);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }]);
