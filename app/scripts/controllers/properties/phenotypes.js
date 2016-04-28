'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypePropertiesController
 * @description
 * # PhenotypePropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypePropertiesController', ['$scope', '$modalInstance', 'LibraryService', 'phenotype', 'isReference', 'properties', function ($scope, $modalInstance, LibraryService, phenotype, isReference, properties) {
    
/* This uses the dynamic forms module directive  angular-dyn-forms */
    $scope.formData = phenotype;
    $scope.displayReferenceNote = isReference;
    $scope.formTemplate = [];
   
     
      
      var ownerOpts = {};
      for (var i = 0; i < properties.owner_groups.length; i++)  
      {
        var term = properties.owner_groups[i];
        ownerOpts[term.tid] =  {label: term.name};
      }
      var viewOpts = {};
      for (var i = 0; i < properties.view_groups.length; i++)  
      {
        var term = properties.view_groups[i];
        viewOpts[term.tid] =  {label: term.name};
      }
      var statusOpts = {};
      for (var i = 0; i < properties.status.length; i++)  
      {
        var term = properties.status[i];
        statusOpts[term.tid] =  {label: term.name};
      }

       /*
        $scope.formTemplate.push({
          'type': 'checkbox',
          'label': repo.description,
          'model': repo.name
        });
      } */
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
          'type': 'select',
          'label': 'Owner Group',
          'empty': 'Select an Owner Group',
          'model': 'owner_group',
          'slaveTo': '1',
          'options': ownerOpts, //{ '1': {'value': 1, 'label': 'My fav group', 'slaveTo':'selected'}, '2': {'value': 2, 'label':'My second fav'}}
        },
        {
          'type': 'select',
          'label': 'View Group',
          'empty': 'Select a View Group',
          'model': 'view_group',
          'slaveTo': '1',
          'options': viewOpts, //{ '1': {'value': 1, 'label': 'My fav group', 'slaveTo':'selected'}, '2': {'value': 2, 'label':'My second fav'}}
        },
        {
          'type': 'select',
          'label': 'Status',
          'empty': 'Select the development status',
          'model': 'status',
          'slaveTo': '1',
          'options': statusOpts, //{ '1': {'value': 1, 'label': 'My fav group', 'slaveTo':'selected'}, '2': {'value': 2, 'label':'My second fav'}}
        },
        {
          'type': 'hidden',
          'label': 'Definition',
          'model': 'definition'
        }
      ];
      
    
    /*for (var i = 0; i < repositories.length; i++)  
    {
      var repo = repositories[i]; 
     
      $scope.formTemplate.push({
        'type': 'checkbox',
        'label': repo.description,
        'model': repo.name
      });
    } */
    
      
    // Watch so the form templates can be updated from the service resolve promise
    /*$scope.$watch(function () { return $scope.formTemplate }, function (newVal, oldVal) {
    if (typeof newVal !== 'undefined') {
        $scope.formTemplate = uaProgressService.taskList;
    }*/

    $scope.ok = function () {
      $modalInstance.close($scope.formData);

    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
