'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:MainController
 * @description
 * # MainController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('MainController', ['$scope', 'LibraryService', function ($scope, LibraryService) {
    $scope.numberOfPhenotypes = 0;

    LibraryService.load()
      .then(LibraryService.processValues)
      .then(function(elements) { $scope.numberOfPhenotypes = elements.length; });
  }]);
