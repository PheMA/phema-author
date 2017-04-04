'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('DashboardController', ['$scope', 'LibraryService', function ($scope, LibraryService) {
    $scope.newsItems = [];

    LibraryService.load()
      .then(LibraryService.processValues)
      .then(function(elements) { $scope.phenotypes = elements; });
  }]);
