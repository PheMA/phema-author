'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('DashboardCtrl', function ($scope) {
    $scope.newsItems = [];
    $scope.phenotypes = [];
  });
