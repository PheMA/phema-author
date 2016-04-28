'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:QDMElementsController
 * @description
 * # QDMElementsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('QDMElementPropertiesController', ['$scope', '$modalInstance', 'QDMElementService', 'AttributeService', 'element', 'valueSet', 'attributes', function ($scope, $modalInstance, QDMElementService, AttributeService, element, valueSet, attributes) {
    $scope.element = element;    // Element is a JSON value, and is a copy of the original
    $scope.valueSet = valueSet;  // Value set is a JSON value, and is a copy of the original
    $scope.formData = attributes || {};
    $scope.isSearchingValueSets = false;
    $scope.selectedValueSets = [];
    $scope.selectedTerms = [];
    $scope.existingValueSet = valueSet;
    $scope.activeTabIndex = (valueSet && valueSet.customList && valueSet.customList.terms && valueSet.customList.terms.length > 0) ? 1 : 0;
    
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
      $scope.valueSet = ValueSet.createElementFromData({valueSets: $scope.selectedValueSets, terms: $scope.selectedTerms});
      $scope.isSearchingValueSets = false;
    };

    $scope.cancelValueSet = function() {
      $scope.isSearchingValueSets = false;
    };
  }]);
