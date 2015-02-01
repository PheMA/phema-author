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
  $scope.codeSystemSearch = '';
  $scope.isSearching = false;
  $scope.termSearchResults = [];
  $scope.valueSetSearchResults = [];
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
    else if (tab === 'codeSystem') {
      if ($scope.codeSystemSearch === '') {
        $scope.isSearching = false;
        $scope.termSearchResults = [];
      }
      else {
        $scope.isSearching = true;
        var codeSystems = [];
        CodeSystemService.search('ICD-9-CM', '2013_2012_08_06', $scope.codeSystemSearch)
          .then(CodeSystemService.processValues)
          .then(function(terms) {
            codeSystems.push({
              id: 'ICD-9-CM (' + terms.length + ' terms)',
              name: 'ICD-9-CM',
              type: 'CodeSystem',
              children: terms});
            $scope.termSearchResults = codeSystems;
            $scope.isSearching = false;
          });
        CodeSystemService.search('ICD-10', '2010', $scope.codeSystemSearch)
          .then(CodeSystemService.processValues)
          .then(function(terms) {
            codeSystems.push({
              id: 'ICD-10 (' + terms.length + ' terms)',
              name: 'ICD-10',
              type: 'CodeSystem',
              children: terms});
            $scope.termSearchResults = codeSystems;
            $scope.isSearching = false;
          });
        CodeSystemService.search('LOINC', '246', $scope.codeSystemSearch)
          .then(CodeSystemService.processValues)
          .then(function(terms) {
            codeSystems.push({
              id: 'LOINC (' + terms.length + ' terms)',
              name: 'LOINC',
              type: 'CodeSystem',
              children: terms});
            $scope.termSearchResults = codeSystems;
            $scope.isSearching = false;
          });
      }
    }
  };

  var filterDelayed = function($scope, tab) {
    $scope.$apply(function(){filterAction($scope, tab);});
  };

  var filterThrottled = _.debounce(filterDelayed, 750);
  $scope.$watch('valueSetSearch', function(){ filterThrottled($scope, 'valueSet'); });
  $scope.$watch('codeSystemSearch', function(){ filterThrottled($scope, 'codeSystem'); });

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
