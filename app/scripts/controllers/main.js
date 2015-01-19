'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:MainController
 * @description
 * # MainController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('MainController', ['$scope', function ($scope) {
    $scope.numberOfPhenotypes = 0;

    $scope.hasPhenotypes = function() {
      return ($scope.numberOfPhenotypes > 0);
    };
  }]);
