'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetPropertiesController
 * @description
 * # ValueSetPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('ValueSetPropertiesController', ['$scope', '$modalInstance', 'ValueSetService', 'valueSet', function ($scope, $modalInstance, ValueSetService, valueSet) {
    $scope.valueSet = valueSet;
    $scope.terms = [];
    // ValueSetService.loadDetails(valueSet.valueSetRepository, valueSet.id)
    //   .then(ValueSetService.processDetails)
    //   .then(function(details) { $scope.terms = details.terms; });
    ValueSetService.handleLoadDetails(valueSet, function(result) {
      $scope.terms = result.terms;
    });

    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
