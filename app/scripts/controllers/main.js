'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:MainController
 * @description
 * # MainController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('MainController', ['$scope', 'LibraryService', 'security', function ($scope, LibraryService, security) {
    $scope.numberOfPhenotypes = 0;
    $scope.errorGettingPhenotypes = false;
    $scope.security = security;
    LibraryService.load()
      .then(LibraryService.processValues)
      .then(function(elements) {
        $scope.numberOfPhenotypes = elements.length;
        $scope.errorGettingPhenotypes = false;
      }, function() {
        $scope.numberOfPhenotypes = 0;
        $scope.errorGettingPhenotypes = true;
      });
  }]);
