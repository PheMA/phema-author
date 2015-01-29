'use strict';
/* globals ArrayUtil, findParentElementByName */

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypeController
 * @description
 * # PhenotypeController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypeController', ['$scope', '$http', '$routeParams', '$modal', '$location', 'algorithmElementFactory', 'TemporalOperatorService', 'LogicalOperatorService', 'QDMElementService', 'LibraryService', function ($scope, $http, $routeParams, $modal, $location, algorithmElementFactory, TemporalOperatorService, LogicalOperatorService, QDMElementService, LibraryService) {
    $scope.phenotype = $routeParams.id;
    $scope.status = { open: [true, false, false, false]};
    $scope.isDeleteDisabled = true;
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

    $scope.$on('sophe-element-selected', function(evt, args) {
      $scope.$apply(function() {
        $scope.isPropertiesDisabled = !$scope.canShowProperties(args);
        $scope.isDeleteDisabled = !$scope.canDelete();
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
      {text: 'Save', iconClass:'fa fa-save', event: $scope.save},
      {text: 'Load', iconClass:'fa fa-folder-open', event: $scope.load},
      {text: 'Export', iconClass:'fa fa-arrow-circle-down'},
      {spacer: true},
      {text: 'Copy', iconClass:'fa fa-copy', event: $scope.copy},
      {text: 'Paste', iconClass:'fa fa-paste', event: $scope.paste},
      {text: 'Undo', iconClass:'fa fa-undo'},
      {text: 'Redo', iconClass:'fa fa-repeat'}
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
        element.type === 'DataElement');
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
        modalInstance = $modal.open({
          templateUrl: 'views/properties/qdmElement.html',
          controller: 'QDMElementPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(element);
            }
          }
        });

        modalInstance.result.then(function (result) {
          element.attributes = result;
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
          // LibraryService.saveDetails(result)
          //   .then(function() {
          //     LibraryService.load()
          //       .then(LibraryService.processValues)
          //       .then(function(elements) { $scope.phenotypes = elements; });
          //   });
        });
      }
    };
  }]);
