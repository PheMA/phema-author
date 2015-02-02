/* globals _ */

'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetsTermsDialogController
 * @description
 * # ValueSetsTermsDialogController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
.controller('ValueSetsTermsDialogController', ['$scope', '$http', '$modalInstance', 'ValueSetService', 'CodeSystemService', function ($scope, $http, $modalInstance, ValueSetService, CodeSystemService) {
  $scope.termSearch = {term: '', isSearching: false, results: []};
  $scope.valueSetSearch = {term: '', isSearching: false, results: []};
  $scope.selectedTerms = [];
  $scope.selectedValueSets = [];

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

  // Used for single-selection mode
  $scope.setSelectedValueSet = function(valueSet) {
    $scope.selectedValueSets[0] = valueSet;
  };

  // Used for modal dialog mode
  $scope.ok = function () {
    $modalInstance.close({valueSets: $scope.selectedValueSets, terms: $scope.selectedTerms});
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);
