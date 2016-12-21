'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsTermsDialogController
 * @description
 * # ValueSetsTermsDialogController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsTermsDialogController', ['$scope', '$http', '$modalInstance', 'ValueSetService', function ($scope, $http, $modalInstance, ValueSetService) {
  $scope.ok = function () {
    // If it's not 1, we default to 0 (which means the "select value set" tab was active)
    if ($scope.selectedTabIndex === 1) {
      $scope.selectedValueSets = null;
      $scope.newValueSet.terms = $scope.selectedTerms;
      ValueSetService.save('phema', $scope.newValueSet)
        .then(function(valueSet) {
          $scope.newValueSet = valueSet;
          $modalInstance.close({valueSets: null, newValueSet: $scope.newValueSet});
        });
    }
    else {
      $modalInstance.close({valueSets: $scope.selectedValueSets, newValueSet: null});
    }
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
