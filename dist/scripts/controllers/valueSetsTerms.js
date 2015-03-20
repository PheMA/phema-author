/* globals _ */

'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsTermsController
 * @description
 * # ValueSetsTermsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsTermsController', ['$scope', '$http', 'ValueSetService', 'CodeSystemService', function ($scope, $http, ValueSetService, CodeSystemService) {
  $scope.termSearch = {term: '', isSearching: false, results: []};
  $scope.valueSetSearch = {term: '', isSearching: false, results: []};
  $scope.selectedValueSetMembers = [];
  $scope.selectedTerms = $scope.selectedTerms || [];
  $scope.selectedValueSets = $scope.selectedValueSets || [];

  $scope.$watch('valueSetSearch.term', function() {
    ValueSetService.searchHelper($scope.valueSetSearch);
  });
  $scope.$watch('termSearch.term', function() {
    CodeSystemService.searchHelper($scope.termSearch);
  });

  // Used for multi-selection mode
  $scope.addToTermList = function(term) {
    if (_.where($scope.selectedTerms, {id: term.id}).length === 0) {
      $scope.selectedTerms.push(angular.copy(term));
    }
  };

  $scope.removeFromTermList = function(term) {
    $scope.selectedTerms = _.filter($scope.selectedTerms, function(item) {
      return item.id !== term.id;
    });
  };

  $scope.loadValueSetDetails = function(valueSet) {
    if(!valueSet.loadDetailStatus) {
      ValueSetService.loadDetails(valueSet.id)
        .then(ValueSetService.processDetails, function() {
          valueSet.loadDetailStatus = 'error';
          valueSet.description = ValueSetService.formatDescription(valueSet);
          $scope.selectedValueSetMembers = valueSet.members;
          }
        )
        .then(function(details) {
          if (details) {
            valueSet.members = details.members;
            valueSet.codeSystems = details.codeSystems;
            valueSet.loadDetailStatus = 'success';
            valueSet.description = ValueSetService.formatDescription(valueSet);
            $scope.selectedValueSetMembers = valueSet.members;
          }
        });
    }
    else {
      $scope.selectedValueSetMembers = valueSet.members;
    }
  };

  // Used for single-selection mode
  $scope.setSelectedValueSet = function(valueSet) {
    $scope.selectedValueSets[0] = valueSet;
    $scope.loadValueSetDetails(valueSet);
  };
}]);
