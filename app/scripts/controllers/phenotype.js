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
  .controller('PhenotypeController', ['$scope', '$http', '$routeParams', '$modal', 'algorithmElementFactory', 'TemporalOperatorService', 'LogicalOperatorService', 'QDMElementService', function ($scope, $http, $routeParams, $modal, algorithmElementFactory, TemporalOperatorService, LogicalOperatorService, QDMElementService) {
    $scope.phenotype = $routeParams.id;
    $scope.status = { open: [true, false, false, false]};
    $scope.isDeleteDisabled = true;
    $scope.isPropertiesDisabled = true;

    $http.get('data/phenotypes.json').success (function(data) {
      var transformedData = [];
      for (var index = 0; index < data.length; index++) {
        transformedData.push({
          name: data[index].name,
          type: 'Phenotype'
        });
      }

      $scope.phenotypes = transformedData.sort(ArrayUtil.sortByName);
    });

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

    $scope.canShowProperties = function(element) {
      var selectedElement = element || algorithmElementFactory.getFirstSelectedItem($scope);
      if (!selectedElement || !selectedElement.element) {
        return false;
      }

      return (selectedElement.element.type === 'TemporalOperator' ||
        selectedElement.element.type === 'LogicalOperator' ||
        selectedElement.element.type === 'Category' ||
        selectedElement.element.type === 'DataElement');
    };

    $scope.showProperties = function() {
      var selectedElement = algorithmElementFactory.getFirstSelectedItem($scope);
      if (!$scope.canShowProperties(selectedElement)) {
        return;
      }

      var modalInstance = null;
      if (selectedElement.element.type === 'TemporalOperator') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/relationship.html',
          controller: 'RelationshipPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(selectedElement.element);
            },
            temporalOperators: function() {
              return $scope.temporalOperators;
            }
          }
        });

        modalInstance.result.then(function (result) {
          // Clicked 'OK'
          var uri = ((result.relationship.modifier) ? result.relationship.modifier.id : result.relationship.base.uri);
          selectedElement.element.uri = uri;
          selectedElement.element.name = ArrayUtil.findInArray($scope.temporalOperators, 'uri', uri).name;
          selectedElement.element.timeRange = result.timeRange;
          if (result.timeRange.comparison) {
            selectedElement.element.timeRange.comparison = result.timeRange.comparison.name;
          }
          selectedElement.label.setText(selectedElement.element.name);
          selectedElement.label.getStage().draw();
        });
      }
      else if (selectedElement.element.type === 'LogicalOperator') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/logicalOperator.html',
          controller: 'LogicalOperatorPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(selectedElement.element);
            },
            containedElements: function () {
              return selectedElement.containedElements;
            },
            logicalOperators: function() {
              return $scope.logicalOperators;
            }
          }
        });

        modalInstance.result.then(function (result) {
          // Clicked 'OK'
          selectedElement.element = result;
          findParentElementByName(selectedElement, 'header').setText(selectedElement.element.name);
          selectedElement.getStage().draw();
        });
      }
      else if (selectedElement.element.type === 'Category' || selectedElement.element.type === 'DataElement') {
        modalInstance = $modal.open({
          templateUrl: 'views/properties/qdmElement.html',
          controller: 'QDMElementPropertiesController',
          size: 'lg',
          resolve: {
            element: function () {
              return angular.copy(selectedElement.element);
            }
          }
        });

        modalInstance.result.then(function (result) {
          // Clicked 'OK'
          // selectedElement.element = result;
          // findParentElementByName(selectedElement, 'header').setText(selectedElement.element.name);
          // selectedElement.getStage().draw();
        });
      }
    };
  }]);
