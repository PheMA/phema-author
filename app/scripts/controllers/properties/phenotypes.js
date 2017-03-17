'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypePropertiesController
 * @description
 * # PhenotypePropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypePropertiesController', ['$scope', '$uibModalInstance', 'LibraryService', 'phenotype', 'isReference', function ($scope, $uibModalInstance, LibraryService, phenotype, isReference) {
    $scope.formData = phenotype;
    $scope.displayReferenceNote = isReference;
    $scope.formTemplate = [
      {
        'type': 'text',
        'label': 'Name',
        'model': 'name'
      },
      {
        'type': 'textarea',
        'label': 'Description',
        'model': 'description'
      },
      {
        'type': 'hidden',
        'label': 'Definition',
        'model': 'definition'
      },
    ];

    $scope.ok = function () {
      $uibModalInstance.close($scope.formData);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }]);
