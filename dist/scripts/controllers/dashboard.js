'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:DashboardController
 * @description
 * # DashboardController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('DashboardController', ['$scope', function ($scope) {
    $scope.newsItems = [];
    $scope.phenotypes = [];
  }]);
