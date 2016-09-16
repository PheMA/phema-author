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
    $modalInstance.close({valueSets: $scope.selectedValueSets, terms: $scope.selectedTerms});
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
