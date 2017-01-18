'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsTermsDialogController
 * @description
 * # ValueSetsTermsDialogController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsTermsDialogController', ['$scope', '$http', '$modalInstance', 'ValueSetService', 'ConfigurationService',
  function ($scope, $http, $modalInstance, ValueSetService, ConfigurationService) {
    $scope.ok = function () {
      // If it's not 1, we default to 0 (which means the "select value set" tab was active)
      if ($scope.selectedTabIndex === 1) {
        ConfigurationService.load().then(function(config) {
          var editableServiceId = 'phema';
          if (config && config.valueSetServices) {
            for (var key in config.valueSetServices) {
              if (config.valueSetServices[key].writable) {
                editableServiceId = key;
                break;
              }
            }
          }

          $scope.selectedValueSets = null;
          $scope.newValueSet.terms = $scope.selectedTerms;
          ValueSetService.save(editableServiceId, $scope.newValueSet)
            .then(function(valueSet) {
              $scope.newValueSet = valueSet;
              $modalInstance.close({valueSets: null, newValueSet: $scope.newValueSet});
            });
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
