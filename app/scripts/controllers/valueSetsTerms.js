/* globals _ */

'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsTermsController
 * @description
 * This is the workhorse for finding/authoring/editing value sets.  It's used from our properties dialog for elements when we display a value set entry
 * field, and at the top of the element properties dialog where the main value set concept is defined.  You'll find it referenced as the value-sets-terms
 * directive in many places in the app.
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsTermsController', ['$scope', '$http', 'ValueSetService', 'CodeSystemService', function ($scope, $http, ValueSetService, CodeSystemService) {
  // selectedTab needs to be an object (even though we are just wrapping a single primitive)
  // so that the 2-way binding from the directive works.  Angular will just pass primitives
  // by value, and we need a reference.
  $scope.selectedTab = $scope.selectedTab || {index: ($scope.$parent.selectedTab ? $scope.$parent.selectedTab.index : 0) };
  $scope.tabActive = [true, false, false];
  $scope.termSearch = {term: '', isSearching: false, results: []};
  $scope.valueSetSearch = {term: '', isSearching: false, results: []};
  $scope.newValueSet = {name: '', description: '', terms: []};
  $scope.selectedValueSetTerms = [];
  $scope.existingValueSet = $scope.existingValueSet || null;
  $scope.existingValueSetEditable = $scope.existingValueSetEditable || false;
  $scope.selectedTerms = $scope.selectedTerms || [];
  $scope.selectedValueSets = $scope.selectedValueSets || [];

  if ($scope.existingValueSet && $scope.existingValueSet.customList) {
    $scope.selectedTerms = $scope.existingValueSet.customList.terms;
  }

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

  $scope.setTab = function(index) {
    $scope.selectedTab.index = index;
  };

  $scope.removeFromTermList = function(term) {
    $scope.selectedTerms = _.filter($scope.selectedTerms, function(item) {
      return item.id !== term.id;
    });
  };

  $scope.loadValueSetDetails = function(valueSet) {
    ValueSetService.handleLoadDetails(valueSet, function(result) {
      $scope.selectedValueSetTerms = result.terms;
    });
  };

  // Used for single-selection mode
  $scope.setSelectedValueSet = function(valueSet) {
    $scope.selectedValueSets[0] = valueSet;
    $scope.loadValueSetDetails(valueSet);
  };
}]);
