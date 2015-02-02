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
  $scope.valueSetSearch = '';
  //$scope.codeSystemSearch = '';
  $scope.isSearching = false;
  //$scope.termSearchResults = [];
  $scope.valueSetSearchResults = [];
  $scope.termSearch = {term: '', isSearching: false, results: []};
  $scope.selectedTerms = [];
  $scope.selectedValueSets = [];

  var filterAction = function($scope, tab) {
    if (tab === 'valueSet') {
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
    }
    // else if (tab === 'codeSystem') {
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
    // }
  };

  var filterDelayed = function($scope, tab) {
    $scope.$apply(function(){filterAction($scope, tab);});
  };

  var filterThrottled = _.debounce(filterDelayed, 750);
  $scope.$watch('valueSetSearch', function(){ filterThrottled($scope, 'valueSet'); });
  //$scope.$watch('codeSystemSearch', function(){ filterThrottled($scope, 'codeSystem'); });

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
