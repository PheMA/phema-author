'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:QDMElementsController
 * @description
 * # QDMElementsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('QDMElementPropertiesController', ['$scope', '$modalInstance', 'QDMElementService', 'AttributeService', 'element', 'valueSet', function ($scope, $modalInstance, QDMElementService, AttributeService, element, valueSet) {
    $scope.element = element;    // Element is a JSON value, and is a copy of the original
    $scope.valueSet = valueSet;  // Value set is a JSON value, and is a copy of the original
    $scope.formData = element.attributes || {};
    $scope.isSearchingValueSets = false;
    $scope.selectedValueSets = [];
    $scope.selectedTerms = [];

    // Load the attributes (makes a call to the data services) and map into the dynamic form format.
    // We are assigning a promise to the form template so that it will load when the data is loaded.
    $scope.formTemplate = { promise: QDMElementService.getAttributes(element).then(function(attributes) {
      var template = [];
      var fieldsets = [];
      for (var index = 0; index < attributes.length; index++) {
        // We may get a null result back from the translation function.  That means we should suppress that field.
        var result = AttributeService.translateQDMToForm(attributes[index]);
        if (result) {
          if (result.type === 'fieldset') {
            fieldsets.push(result);
          }
          else {
            template.push(result);
          }
        }
      }
      
      // We want to put all fieldsets at the end
      for (index = 0; index < fieldsets.length; index++) {
        template.push(fieldsets[index]);
      }
      return template;
    })};
    
    $scope.chooseValueSet = function() {
      $scope.isSearchingValueSets = !$scope.isSearchingValueSets;
    }

    $scope.ok = function () {
      $modalInstance.close({attributes: $scope.formData, valueSet: $scope.valueSet});
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    
    $scope.saveValueSet = function() {
      $scope.valueSet = ValueSet.createElementFromData({valueSets: $scope.selectedValueSets, terms: $scope.selectedTerms});
      $scope.isSearchingValueSets = false;
    };
    
    $scope.cancelValueSet = function() {
      $scope.isSearchingValueSets = false;
    };
  }]);
