'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypePropertiesController
 * @description
 * # PhenotypePropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypePropertiesController', ['$scope', '$modalInstance', 'LibraryService', 'phenotype', function ($scope, $modalInstance, LibraryService, phenotype) {
    $scope.formData = phenotype;
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
      $modalInstance.close($scope.formData);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
