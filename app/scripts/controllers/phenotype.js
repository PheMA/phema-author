'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypectrlCtrl
 * @description
 * # PhenotypectrlCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypeCtrl', ['$scope', '$http', '$routeParams', 'algorithmElementFactory', function ($scope, $http, $routeParams, algorithmElementFactory) {
    $scope.phenotype = $routeParams.id;

    function sortByName(obj1, obj2) {
      return obj1.name.localeCompare(obj2.name);
    }

    $http.get('data/phenotypes.json').success (function(data) {
      $scope.phenotypes = data.sort(sortByName);
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
        $scope.dataElements = transformedData.sort(sortByName);
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
          $scope.dataElements[categoryIndex].children = $scope.dataElements[categoryIndex].children.sort(sortByName);
        }
      }
    });

    $http.get('data/qdm-logicalOperators.json').success (function(data){
      $scope.logicalOperators = [];
      if (data && data.results) {
        var transformedData = [];
        var originalData = data.results.bindings;
        for (var index = 0; index < originalData.length; index++) {
          transformedData.push({
            name: originalData[index].logicalOperatorLabel.value,
            uri: originalData[index].id.value,
            type: 'LogicalOperator',
            children: []} );
        }
        $scope.logicalOperators = transformedData.sort(sortByName);
      }
    });

    $http.get('data/qdm-temporalOperators.json').success (function(data){
      $scope.temporalOperators = [];
      if (data && data.results) {
        var transformedData = [];
        var originalData = data.results.bindings;
        for (var index = 0; index < originalData.length; index++) {
          transformedData.push({
            name: originalData[index].temporalOperatorLabel.value,
            uri: originalData[index].id.value,
            type: 'TemporalOperator',
            children: []} );
        }
        $scope.temporalOperators = transformedData.sort(sortByName);
      }
    });

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
  }]);
