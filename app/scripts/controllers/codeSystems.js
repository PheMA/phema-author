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
  $scope.search = {term: '', isSearching: false, results: []};
  $scope.selectedCodeSystems = [];

  $scope.$watch('search.term', function() {
    CodeSystemService.searchHelper($scope.search);
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
