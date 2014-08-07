'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('MainCtrl', function ($scope) {
    $scope.numberOfPhenotypes = 0;

    $scope.hasPhenotypes = function() {
      return ($scope.numberOfPhenotypes > 0);
    };
  });
