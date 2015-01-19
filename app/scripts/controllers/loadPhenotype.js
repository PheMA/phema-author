'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:LoadPhenotypeController
 * @description
 * # QDMElementsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('LoadPhenotypeController', ['$scope', '$modalInstance', 'phenotypes', function ($scope, $modalInstance, phenotypes) {
    $scope.phenotypes = phenotypes;

    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
