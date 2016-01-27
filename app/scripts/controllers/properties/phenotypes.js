'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypePropertiesController
 * @description
 * # PhenotypePropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypePropertiesController', ['$scope', '$modalInstance', 'LibraryService', 'phenotype', 'isReference', 'repositories', function ($scope, $modalInstance, LibraryService, phenotype, isReference, repositories) {
    $scope.formData = phenotype;
    $scope.displayReferenceNote = isReference;
    $scope.repositories = repositories;
    console.log(repositories);
    
    // Get list of available repositories from the library service 
    //LibraryService.repositories()
     // .then(function(elements) { $scope.repositories = elements; });
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
      }];
      for (var key in $scope.repositories)
      {
        console.log(key);
        /*console.log($scope.repositories.key)
        var repo =  key;
        var label = $scope.repositories.key;
        $scope.formTemplate.push({
          'type': 'checkbox',
          'label': label,
          'model': key
        });*/
      }
      $scope.formTemplate.push(
      {
        'type': 'hidden',
        'label': 'Definition',
        'model': 'definition'
      });
    

    $scope.ok = function () {
      $modalInstance.close($scope.formData);

    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
