/* globals _, ValueSet, Constants */

'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsController
 * @description
 * # ValueSetsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsController', ['$scope', '$http', '$timeout', 'ValueSetService', function ($scope, $http, $timeout, ValueSetService) {
  $scope.searchTerm = '';
  $scope.isSearching = false;
  $scope.searchResults = [];
  $scope.selectedValueSets = $scope.selectedValueSets || [];
  $scope.treeOptions = {
    dirSelectable: false,
    isLeaf: function(node) {
       return $scope.isValueSet(node);
    }
  };

  $scope.loadValueSetDetails = function(el) {
    $timeout(function() {
      ValueSetService.handleLoadDetails(el.node, function (valueSet) {
        el.node = valueSet;
      });
    }, 0);
  };

  $scope.$watch('searchTerm', function() {
    if ($scope.searchTerm === '') {
      $scope.isSearching = false;
      $scope.searchResults = [];
    }
    else {
      $scope.isSearching = true;
      ValueSetService.search($scope.searchTerm)
        .then(ValueSetService.processValues)
        .then(function(valueSets) {
          $scope.searchResults = valueSets;
          $scope.isSearching = false;
        });
    }
  });

  // Used for multi-selection mode
  $scope.addToList = function(valueSet) {
    if (_.where($scope.selectedValueSets, {id: valueSet.id}).length === 0) {
      $scope.selectedValueSets.push(angular.copy(valueSet));
    }
  };

  // Helper for our view to determine if a tree node is a value set
  $scope.isValueSet = function(node) {
    return node.type === Constants.ElementTypes.VALUE_SET;
  };

  $scope.removeFromList = function(valueSet) {
    $scope.selectedValueSets = _.filter($scope.selectedValueSets, function(item) {
      return item.id !== valueSet.id;
    });
  };

  // Used for single-selection mode
  $scope.setSelected = function(valueSet) {
    $scope.selectedValueSets[0] = valueSet;
  };

  $scope.chooseValueSet = function() {
    $scope.isSearching = !$scope.isSearchingValueSets;
  };

  $scope.saveValueSet = function() {
    $scope.selectedValueSets[0] = ValueSet.createElementFromData({valueSets: $scope.selectedValueSets, terms: $scope.selectedTerms});
    $scope.isSearching = false;
  };

  $scope.cancelValueSet = function() {
    $scope.isSearching = false;
  };

  $scope.reset = function() {
    $scope.selectedValueSets = [];
  };
}]);
