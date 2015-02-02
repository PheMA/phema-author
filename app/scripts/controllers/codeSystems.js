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

  $scope.$watch('searchTerm', function() {
    if ($scope.searchTerm === '') {
      $scope.isSearching = false;
      $scope.searchResults = [];
    }
    else {
      $scope.isSearching = true;
      $scope.searchResults = [];
      var codeSystems = [];
      for (var index = 0; index < CodeSystemService.supportedCodeSystems.length; index++) {
        var item = CodeSystemService.supportedCodeSystems[index];
        CodeSystemService.search(item.codeSystem, item.version, $scope.searchTerm)
          .then(CodeSystemService.processValues)
          .then(function(terms) {
            codeSystems.push({
              id: item.codeSystem,
              name: item.codeSystem + ' (' + terms.length + ' terms)',
              type: 'CodeSystem',
              children: terms});
            $scope.searchResults = codeSystems;
            $scope.isSearching = false;
          });
      }
    }
  });

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
