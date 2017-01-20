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
  $scope.selectedTabIndex = $scope.selectedTabIndex || ($scope.$parent.selectedTabIndex ? $scope.$parent.selectedTabIndex : 0);
  $scope.tabActive = [true, false, false];
  $scope.termSearch = {term: '', isSearching: false, results: []};
  $scope.valueSetSearch = {term: '', isSearching: false, results: []};
  $scope.newValueSet = {name: '', description: '', terms: []};
  $scope.editValueSet = $scope.existingValueSet || null;
  $scope.selectedValueSetMembers = [];
  $scope.existingValueSet = $scope.existingValueSet || {};
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
    $scope.selectedTabIndex = index;
  };

  $scope.removeFromTermList = function(term) {
    $scope.selectedTerms = _.filter($scope.selectedTerms, function(item) {
      return item.id !== term.id;
    });
  };

  $scope.loadValueSetDetails = function(valueSet) {
    ValueSetService.handleLoadDetails(valueSet, function(result) {
      $scope.selectedValueSetMembers = result.members;
    });
    // if(!valueSet.loadDetailStatus) {
    //   ValueSetService.loadDetails(valueSet.valueSetRepository, valueSet.id)
    //     .then(ValueSetService.processDetails, function() {
    //       valueSet.loadDetailStatus = 'error';
    //       valueSet.description = ValueSetService.formatDescription(valueSet);
    //       $scope.selectedValueSetMembers = valueSet.members;
    //       }
    //     )
    //     .then(function(details) {
    //       if (details) {
    //         valueSet.members = details.members;
    //         valueSet.codeSystems = details.codeSystems;
    //         valueSet.loadDetailStatus = 'success';
    //         valueSet.description = ValueSetService.formatDescription(valueSet);
    //         $scope.selectedValueSetMembers = valueSet.members;
    //       }
    //     });
    // }
    // else {
    //   $scope.selectedValueSetMembers = valueSet.members;
    // }
  };

  // Used for single-selection mode
  $scope.setSelectedValueSet = function(valueSet) {
    $scope.selectedValueSets[0] = valueSet;
    $scope.loadValueSetDetails(valueSet);
  };
}]);
