'use strict';
/* globals ArrayUtil, findParentElementByName, ValueSet, _ */

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypeController
 * @description
 * # PhenotypeController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypeController', ['$scope', '$http', '$routeParams', '$modal', '$location', 'algorithmElementFactory', 'TemporalOperatorService', 'LogicalOperatorService', 'QDMElementService', 'FHIRElementService', 'LibraryService', function ($scope, $http, $routeParams, $modal, $location, algorithmElementFactory, TemporalOperatorService, LogicalOperatorService, QDMElementService, FHIRElementService, LibraryService) {
    $scope.phenotype = $routeParams.id;
    $scope.status = { open: [true, false, false, false, false, false, false]};
    $scope.isPropertiesDisabled = true;
    var advancedRegEx = new RegExp('[a-z]+\\sConcurrent With', 'i');
    $scope.temporalFilter = function(item) {
      if (item) {
        return (item.name.search(advancedRegEx) === -1);
      }
    };

    LibraryService.load()
      .then(LibraryService.processValues)
      .then(function(elements) { $scope.phenotypes = elements; });

    FHIRElementService.load()
      .then(FHIRElementService.processValues)
      .then(function(elements) { $scope.fhirElements = elements; });

    QDMElementService.load()
      .then(QDMElementService.processValues)
      .then(function(elements) { $scope.dataElements = elements; });

    LogicalOperatorService.load()
      .then(LogicalOperatorService.processValues)
      .then(function(operators) { $scope.logicalOperators = operators; });

    TemporalOperatorService.load()
      .then(TemporalOperatorService.processValues)
      .then(function(operators) { $scope.temporalOperators = operators; });

    $scope.treeOptions = {
      dirSelectable: false
    };

    $scope.$on('sophe-search-valuesets', function(evt, dataElement) {
      var modalInstance = $modal.open({
        templateUrl: 'views/elements/valueSetsTermsDialog.html',
        controller: 'ValueSetsTermsDialogController',
        size: 'lg'
      });

      modalInstance.result.then(function (result) {
        if (result) {
          // If we just have a value set, we will create that and place it in the object
          var valueSet;
          var element = ValueSet.createElementFromData(result);
          valueSet = $scope.addWorkflowObject({x: 0, y: 0, element: element});
          dataElement.phemaObject().valueSet(valueSet);
          if (element.customList) {
            valueSet.phemaObject().customList(result);
            delete element.customList;
          }
          dataElement.getStage().draw();
        }
      });
    });

    $scope.$on('sophe-element-selected', function(evt, args) {
      $scope.$apply(function() {
        $scope.isPropertiesDisabled = !$scope.canShowProperties(args);
        _.findWhere($scope.buttons, {text: 'Delete'}).disabled = !$scope.canDelete();
      });
    });

    // If a specific phenotype was specified, load it now
    if ($scope.phenotype) {
      $scope.$watch('canvasDetails', function() {
        if ($scope.canvasDetails) {
          LibraryService.loadDetails($scope.phenotype)
            .then(function(phenotype) {
              algorithmElementFactory.loadFromDefinition($scope, phenotype.definition);
            });
        }
      });
    }

    // config object:
    //   x
    //   y
    //   element
    $scope.addWorkflowObject = function (config) {
      return algorithmElementFactory.addWorkflowObject(config, $scope);
    };

    $scope.copy = function() {
      console.log('Copy');
    };

    $scope.canDelete = function() {
      return (algorithmElementFactory.getFirstSelectedItem($scope) !== null);
    };

    $scope.delete = function() {
      algorithmElementFactory.deleteSelectedObjects($scope);
    };

    $scope.paste = function() {
      console.log('Paste');
    };

    $scope.save = function() {
      var modalInstance = $modal.open({
        templateUrl: 'views/properties/phenotype.html',
        controller: 'PhenotypePropertiesController',
        size: 'lg',
        resolve: {
          phenotype: function() {
            return {definition: $scope.canvasDetails.kineticStageObj.find('#mainLayer')[0].toJSON() };
          },
          isReference: function() { return false; }
        }
      });

      modalInstance.result.then(function (result) {
        LibraryService.saveDetails(result)
          .then(function(data) {
            $location.path('/phenotype/' + data.id);
          });
      });
    };

    $scope.load = function() {
      var modalInstance = $modal.open({
        templateUrl: 'views/phenotypes/load.html',
        controller: 'LoadPhenotypeController',
        size: 'lg',
        resolve: {
          phenotypes: function() {
            return $scope.phenotypes;
          }
        }
      });

      // If the user selects a phenotype to load, redirect to that phenotype's ID which
      // will cause it to load properly.
      modalInstance.result.then(function (id) {
        $location.path('/phenotype/' + id);
      });
    };

    $scope.buttons = [
      {text: 'Save', iconClass:'fa fa-save', event: $scope.save, disabled: false},
      {text: 'Load', iconClass:'fa fa-folder-open', event: $scope.load, disabled: false},
      {text: 'Export', iconClass:'fa fa-arrow-circle-down', disabled: true},
      {spacer: true},
      {text: 'Copy', iconClass:'fa fa-copy', event: $scope.copy, disabled: true},
      {text: 'Paste', iconClass:'fa fa-paste', event: $scope.paste, disabled: true},
      {text: 'Undo', iconClass:'fa fa-undo', disabled: true},
      {text: 'Redo', iconClass:'fa fa-repeat', disabled: true},
      {spacer: true},
      {text: 'Delete', iconClass:'fa fa-remove', event: $scope.delete, disabled: true},
    ];

    $scope.canShowProperties = function(item) {
      var selectedElement = item || algorithmElementFactory.getFirstSelectedItem($scope);
      if (!selectedElement || !selectedElement.element) {
        return false;
      }

      var element = selectedElement.element();
      return (element.type === 'TemporalOperator' ||
        element.type === 'LogicalOperator' ||
        element.type === 'Category' ||
        element.type === 'Phenotype' ||
        element.type === 'DataElement' ||
        element.type === 'ValueSet');
    };

    $scope.showProperties = function() {
      var selectedElement = algorithmElementFactory.getFirstSelectedItem($scope);
      if (!$scope.canShowProperties(selectedElement)) {
        return;
      }

      var modalInstance = null;
      var element = selectedElement.element();
      if (element.type === 'TemporalOperator') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/relationship.html',
          controller: 'RelationshipPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            },
            temporalOperators: function() {
              return $scope.temporalOperators;
            }
          }
        });

        modalInstance.result.then(function (result) {
          var uri = ((result.relationship.modifier) ? result.relationship.modifier.id : result.relationship.base.uri);
          element.uri = uri;
          element.name = ArrayUtil.findInArrayOrChildren($scope.temporalOperators, 'uri', uri).name;
          element.timeRange = result.timeRange;
          if (result.timeRange.comparison) {
            element.timeRange.comparison = result.timeRange.comparison.name;
          }
          var label = selectedElement.label();
          label.setText(element.name);
          label.getStage().draw();
        });
      }
      else if (element.type === 'LogicalOperator') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/logicalOperator.html',
          controller: 'LogicalOperatorPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            },
            containedElements: function () {
              return selectedElement.phemaObject().containedElements();
            },
            logicalOperators: function() {
              return $scope.logicalOperators;
            }
          }
        });

        modalInstance.result.then(function (result) {
          element = result;
          findParentElementByName(selectedElement, 'header').setText(element.name);
          selectedElement.getStage().draw();
        });
      }
      else if (element.type === 'Category' || element.type === 'DataElement') {
        // We define the element properties based on the URI (if it's QDM or FHIR)
        var isFHIR = (element.uri.indexOf('fhir') >= 0);
        modalInstance = $modal.open({
          templateUrl: (isFHIR ? 'views/properties/fhirElement.html' : 'views/properties/qdmElement.html'),
          controller: (isFHIR ? 'FHIRElementPropertiesController' : 'QDMElementPropertiesController'),
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            },
            valueSet: function() {
              if (selectedElement.phemaObject() && selectedElement.phemaObject().valueSet()) {
                return angular.copy(selectedElement.phemaObject().valueSet().element());
              }
              else {
                return null;
              }
            }
          }
        });

        modalInstance.result.then(function (result) {
          element.attributes = result.attributes;

          var createNewVS = false;
          var removeOldVS = false;
          var existingValueSet = null;
          if (selectedElement.phemaObject() &&
              selectedElement.phemaObject().valueSet() &&
              selectedElement.phemaObject().valueSet().element()) {
            existingValueSet = selectedElement.phemaObject().valueSet();
            if (existingValueSet.element().id !== result.valueSet.id) {
              createNewVS = true;
              removeOldVS = true;
            }
          }
          else if (result.valueSet.id) {
            createNewVS = true;
          }

          if (removeOldVS) {
            // Remove the old element from the UI
            algorithmElementFactory.destroyGroup(existingValueSet);
            selectedElement.phemaObject().valueSet(null);
          }

          if (createNewVS) {
            var newValueSet = $scope.addWorkflowObject({x: 0, y: 0, element: result.valueSet});
            selectedElement.phemaObject().valueSet(newValueSet);
            if (result.valueSet.customList) {
              newValueSet.phemaObject().customList(result.valueSet.customList);
              delete result.valueSet.customList;
            }
            selectedElement.getStage().draw();
          }
        });
      }
      else if (element.type === 'Phenotype') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/phenotype.html',
          controller: 'PhenotypePropertiesController',
          size: 'lg',
          resolve: {
            phenotype: function () {
              return angular.copy(element);
            },
            isReference: function() { return true; }
          }
        });

        modalInstance.result.then(function (result) {
          element.name = result.name;
          element.description = result.description;
          findParentElementByName(selectedElement, 'header').setText(element.name);
          selectedElement.getStage().draw();
        });
      }
      else if (element.type === 'ValueSet') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/valueSet.html',
          controller: 'ValueSetPropertiesController',
          size: 'lg',
          resolve: {
            valueSet: function () {
              return angular.copy(element);
            },
            isReference: function() { return true; }
          }
        });
      }
    };

    $scope.$on('sophe-empty-temporal-operator-created', function() {
      $scope.$apply(function() {
        $scope.showProperties();
      });
    });
  }]);
