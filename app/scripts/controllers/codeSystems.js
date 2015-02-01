/* globals _ */

'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:CodeSystemsController
 * @description
 * # CodeSystemsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
.controller('CodeSystemsController', ['$scope', '$http', 'CodeSystemService', function ($scope, $http, CodeSystemService) {
  $scope.searchTerm = '';
  $scope.isSearching = false;
  $scope.searchResults = [];
  $scope.selectedCodeSystems = [];

  var filterAction = function($scope) {
    if ($scope.searchTerm === '') {
      $scope.isSearching = false;
      $scope.searchResults = [];
    }
    else {
      $scope.isSearching = true;
      $scope.searchResults = [];
      var codeSystems = [];
      CodeSystemService.search('ICD-9-CM', '2013_2012_08_06', $scope.searchTerm)
        .then(CodeSystemService.processValues)
        .then(function(terms) {
          codeSystems.push({
            name: 'ICD-9-CM (' + terms.length + ' terms)',
            id: 'ICD-9-CM',
            type: 'CodeSystem',
            children: terms});
          $scope.searchResults = codeSystems;
          $scope.isSearching = false;
        });
      CodeSystemService.search('ICD-10', '2010', $scope.searchTerm)
        .then(CodeSystemService.processValues)
        .then(function(terms) {
          codeSystems.push({
            name: 'ICD-10 (' + terms.length + ' terms)',
            id: 'ICD-10',
            type: 'CodeSystem',
            children: terms});
          $scope.searchResults = codeSystems;
          $scope.isSearching = false;
        });
      CodeSystemService.search('LOINC', '246', $scope.searchTerm)
        .then(CodeSystemService.processValues)
        .then(function(terms) {
          codeSystems.push({
            name: 'LOINC (' + terms.length + ' terms)',
            id: 'LOINC',
            type: 'CodeSystem',
            children: terms});
          $scope.searchResults = codeSystems;
          $scope.isSearching = false;
        });
    }
  };

  var filterDelayed = function($scope) {
    $scope.$apply(function(){filterAction($scope);});
  };

  var filterThrottled = _.debounce(filterDelayed, 750);
  $scope.$watch('searchTerm', function(){filterThrottled($scope);});

  // Used for multi-selection mode
  $scope.addToList = function(codeSystem) {
    if (_.where($scope.selectedCodeSystems, {id: codeSystem.id}).length === 0) {
      $scope.selectedCodeSystems.push(angular.copy(codeSystem));
    }
  };

  $scope.removeFromList = function(codeSystem) {
    $scope.selectedCodeSystems = _.filter($scope.selectedCodeSystems, function(item) {
      return item.id !== codeSystem.id;
    });
  };

  // Used for single-selection mode
  $scope.setSelected = function(codeSystem) {
    $scope.selectedCodeSystems[0] = codeSystem;
  };
}]);
