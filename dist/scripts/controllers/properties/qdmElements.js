'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:QDMElementsController
 * @description
 * # QDMElementsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('QDMElementPropertiesController', ['$scope', '$modalInstance', 'QDMElementService', 'AttributeService', 'ValueSetService', 'element', 'valueSet', 'attributes', function ($scope, $modalInstance, QDMElementService, AttributeService, ValueSetService, element, valueSet, attributes) {
    $scope.element = element;    // Element is a JSON value, and is a copy of the original
    $scope.valueSet = valueSet;  // Value set is a JSON value, and is a copy of the original
    $scope.formData = attributes || {};
    $scope.isSearchingValueSets = false;
    $scope.selectedValueSets = [];
    $scope.selectedTerms = [];
    $scope.newValueSet = {};
    $scope.existingValueSet = null;
    $scope.existingValueSetEditable = false;
    // selectedTab needs to be an object (even though we are just wrapping a single primitive)
    // so that the 2-way binding from the directive works.  Angular will just pass primitives
    // by value, and we need a reference.
    $scope.selectedTab = {index: 0};

    if (valueSet) {
      ValueSetService.handleLoadDetails(valueSet, function(result) {
        valueSet = result;
        ValueSetService.isValueSetEditable(valueSet, function(editable) {
          $scope.existingValueSetEditable = editable;
          if (editable) {
            $scope.existingValueSet = angular.copy(valueSet);  // copy so if we edit and cancel changes the original isn't affected
            $scope.selectedTerms = valueSet.terms;
          }
        });
      });
    }

    // UnitService.load()
      // .then(UnitService.processValues)
      // .then(function(units) { $scope.units = units; });

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

      // There are standard attributes available to every data element that are implied.
      // We will explicitly define those here
      template.push({ 'type': 'valueSet', 'label': 'Health Record Field', 'model': 'HealthRecordField' });
      template.push({ 'type': 'valueSet', 'label': 'Source', 'model': 'Source' });
      template.push({ 'type': 'valueSet', 'label': 'Recorder', 'model': 'Recorder' });
      template.push({ 'type': 'checkbox', 'label': 'Reference this element later', 'model': 'Occurrence' });

      // We want to put all fieldsets at the end
      for (index = 0; index < fieldsets.length; index++) {
        template.push(fieldsets[index]);
      }
      return template;
    })};

    $scope.ok = function () {
      $modalInstance.close({attributes: $scope.formData, valueSet: $scope.valueSet});
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.chooseValueSet = function() {
      $scope.isSearchingValueSets = true;
    }

    $scope.saveValueSet = function() {
      if (!$scope.selectedTab || $scope.selectedTab.index === 0) {
        $scope.valueSet = ValueSet.createElementFromData({valueSets: $scope.selectedValueSets, terms: $scope.selectedTerms});
      }
      // Tab 2 means we are saving and updating an existing value set
      else if ($scope.selectedTab.index === 2) {
        $scope.valueSet = angular.copy($scope.existingValueSet);
        $scope.selectedValueSets = null;
        $scope.existingValueSet.terms = $scope.selectedTerms;
        ValueSetService.handleSave($scope.existingValueSet, function(savedValueSet) {
          $scope.existingValueSet = savedValueSet;
          $scope.valueSet = savedValueSet;
          //$modalInstance.close({valueSets: null, newValueSet: $scope.existingValueSet});
        });
      }
      else {
        $scope.valueSet = angular.copy($scope.existingValueSet);
      };
      $scope.isSearchingValueSets = false;
    };

    $scope.cancelValueSet = function() {
      $scope.isSearchingValueSets = false;
    };
  }]);
