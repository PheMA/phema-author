'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsTermsDialogController
 * @description
 * # ValueSetsTermsDialogController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsTermsDialogController', ['$scope', '$http', '$modalInstance', function ($scope, $http, $modalInstance) {
  $scope.ok = function () {
    $scope.newValueSet.terms = $scope.selectedTerms;
    $modalInstance.close({valueSets: $scope.selectedValueSets, newValueSet: $scope.newValueSet, });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
