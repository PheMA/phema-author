'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:SavePhenotypeController
 * @description
 * # SavePhenotypeController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('SavePhenotypeController', ['$scope', '$modalInstance', 'definition', function ($scope, $modalInstance, definition) {
    console.log(definition);
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
    $scope.formData = {definition: definition};

    $scope.ok = function () {
      $modalInstance.close($scope.formData);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
