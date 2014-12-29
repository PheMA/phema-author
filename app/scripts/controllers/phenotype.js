'use strict';
/* globals ArrayUtil, findParentElementByName */

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypectrlCtrl
 * @description
 * # PhenotypectrlCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypeCtrl', ['$scope', '$http', '$routeParams', '$modal', 'algorithmElementFactory', 'TemporalOperatorService', 'LogicalOperatorService', function ($scope, $http, $routeParams, $modal, algorithmElementFactory, TemporalOperatorService, LogicalOperatorService) {
    $scope.phenotype = $routeParams.id;
    $scope.status = { open: [true, false, false, false]};

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

    $http.get('data/qdm-categories.json').success (function(data){
      $scope.dataElements = [];
      if (data && data.results) {
        var transformedData = [];
        var originalData = data.results.bindings;
        for (var index = 0; index < originalData.length; index++) {
          transformedData.push({
            name: originalData[index].categoryLabel.value,
            uri: originalData[index].id.value,
            type: 'Category',
            children: []} );
        }
        $scope.dataElements = transformedData.sort(ArrayUtil.sortByName);
      }
    });

    $http.get('data/qdm-elements.json').success (function(data){
      if (data && data.results) {
        var originalData = data.results.bindings;
        var categoryIndex = 0;
        for (var index = 0; index < originalData.length; index++) {
          for (categoryIndex = 0; categoryIndex < $scope.dataElements.length; categoryIndex++) {
            if ($scope.dataElements[categoryIndex].uri === originalData[index].context.value) {
              $scope.dataElements[categoryIndex].children.push({
                name: originalData[index].dataElementLabel.value,
                uri: originalData[index].id.value,
                type: 'DataElement'
              });
              break;
            }
          }
        }

        for (categoryIndex = 0; categoryIndex < $scope.dataElements.length; categoryIndex++) {
          $scope.dataElements[categoryIndex].children = $scope.dataElements[categoryIndex].children.sort(ArrayUtil.sortByName);
        }
      }
    });

    LogicalOperatorService.load()
      .then(LogicalOperatorService.processValues)
      .then(function(operators) { $scope.logicalOperators = operators; });

    TemporalOperatorService.load()
      .then(TemporalOperatorService.processValues)
      .then(function(operators) { $scope.temporalOperators = operators; });

    $scope.treeOptions = {
      dirSelectable: false
    };

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
        selectedElement.element.type === 'LogicalOperator');
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
          controller: 'RelationshipPropertiesCtrl',
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
          controller: 'LogicalOperatorPropertiesCtrl',
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
          selectedElement.element = result;
          findParentElementByName(selectedElement, 'header').setText(selectedElement.element.name);
          selectedElement.getStage().draw();
          // Clicked 'OK'
          //var uri = ((result.relationship.modifier) ? result.relationship.modifier.id : result.relationship.base.uri);
          // selectedElement.element.uri = uri;
          // selectedElement.element.name = ArrayUtil.findInArray($scope.temporalOperators, 'uri', uri).name;
          // selectedElement.element.timeRange = result.timeRange;
          // if (result.timeRange.comparison) {
          //   selectedElement.element.timeRange.comparison = result.timeRange.comparison.name;
          // }
          // selectedElement.label.setText(selectedElement.element.name);
          // selectedElement.label.getStage().draw();
        });
      }
    };
  }]);
