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
  // .filter('temporalFilter', function() {
  //   return function(items) {
  //     if (items) {
  //       var advancedRegEx = new RegExp('^[a-z]+\\sConcurrent With', 'i');
  //       var list = items.filter(function(element) {
  //         return (element.label.search(advancedRegEx) === -1);
  //       });
  //       return list;
  //     }
  //   };
  // })
  .controller('PhenotypeController', ['$scope', '$http', '$routeParams', '$modal', 'algorithmElementFactory', 'TemporalOperatorService', 'LogicalOperatorService', 'QDMElementService', 'LibraryService', function ($scope, $http, $routeParams, $modal, algorithmElementFactory, TemporalOperatorService, LogicalOperatorService, QDMElementService, LibraryService) {
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
      console.log($scope.canvasDetails.kineticStageObj.toJSON());
    };

    $scope.buttons = [
      {text: 'Save', iconClass:'fa fa-save', event: $scope.save},
      {text: 'Export', iconClass:'fa fa-arrow-circle-down'},
      {spacer: true},
      {text: 'Copy', iconClass:'fa fa-copy', event: $scope.copy},
      {text: 'Paste', iconClass:'fa fa-paste', event: $scope.paste},
      {text: 'Undo', iconClass:'fa fa-undo'},
      {text: 'Redo', iconClass:'fa fa-repeat'}
    ];

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
          var uri = ((result.relationship.modifier) ? result.relationship.modifier.id : result.relationship.base.uri);
          selectedElement.element.uri = uri;
          selectedElement.element.name = ArrayUtil.findInArrayOrChildren($scope.temporalOperators, 'uri', uri).name;
          //selectedElement.element.name = ArrayUtil.findInArray($scope.temporalOperators, 'uri', uri).name;
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
          selectedElement.element.attributes = result;
        });
      }
    };
  }]);
