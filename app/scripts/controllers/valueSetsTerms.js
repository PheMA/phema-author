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
  $scope.valueSetSearch = '';
  //$scope.codeSystemSearch = '';
  $scope.isSearching = false;
  //$scope.termSearchResults = [];
  $scope.valueSetSearchResults = [];
  $scope.termSearch = {term: '', isSearching: false, results: []};
  $scope.selectedTerms = [];
  $scope.selectedValueSets = [];

  $scope.$watch('valueSetSearch', function() {
    if ($scope.valueSetSearch === '') {
      $scope.isSearching = false;
      $scope.valueSetSearchResults = [];
    }
    else {
      $scope.isSearching = true;
      ValueSetService.search($scope.valueSetSearch)
        .then(ValueSetService.processValues)
        .then(function(valueSets) {
          $scope.valueSetSearchResults = valueSets;
          $scope.isSearching = false;
        });
    }
  });

  $scope.$watch('termSearch.term', function() {
    CodeSystemService.searchHelper($scope.termSearch);
  });

  // $scope.$watch('codeSystemSearch', function() {
  //   if ($scope.codeSystemSearch === '') {
  //     $scope.isSearching = false;
  //     $scope.termSearchResults = [];
  //   }
  //   else {
  //     $scope.isSearching = true;
  //     var codeSystems = [];
  //     for (var index = 0; index < CodeSystemService.supportedCodeSystems.length; index++) {
  //       var item = CodeSystemService.supportedCodeSystems[index];
  //       CodeSystemService.search(item.codeSystem, item.version, $scope.searchTerm)
  //         .then(CodeSystemService.processValues)
  //         .then(function(terms) {
  //           codeSystems.push({
  //             id: item.codeSystem,
  //             name: item.codeSystem + ' (' + terms.length + ' terms)',
  //             type: 'CodeSystem',
  //             children: terms});
  //           $scope.termSearchResults = codeSystems;
  //           $scope.isSearching = false;
  //         });
  //     }
  //   }
  // });

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
}]);
