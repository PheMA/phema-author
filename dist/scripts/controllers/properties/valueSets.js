'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetPropertiesController
 * @description
 * # ValueSetPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('ValueSetPropertiesController', ['$scope', '$uibModalInstance', 'ValueSetService', 'valueSet', function ($scope, $uibModalInstance, ValueSetService, valueSet) {
    $scope.valueSet = valueSet;
    $scope.terms = [];
    ValueSetService.handleLoadDetails(valueSet, function(result) {
      $scope.terms = result.terms;
    });

    $scope.ok = function () {
      $uibModalInstance.close();
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }]);
