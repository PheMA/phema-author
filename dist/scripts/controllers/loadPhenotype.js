'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:LoadPhenotypeController
 * @description
 * # QDMElementsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('LoadPhenotypeController', ['$scope', '$uibModalInstance', 'phenotypes', function ($scope, $uibModalInstance, phenotypes) {
    $scope.phenotypes = phenotypes;

    $scope.ok = function (id) {
      $uibModalInstance.close(id);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }]);
