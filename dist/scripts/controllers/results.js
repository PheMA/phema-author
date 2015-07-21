'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PromptController
 * @description
 * # PromptController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('ResultsController', ['$scope', 'UnitService', function ($scope, UnitService) {
    $scope.units = [];

    UnitService.load()
      .then(UnitService.processValues)
      .then(function(units) {
        $scope.units = units;
        //$scope.result.units = $scope.result.units;
      });
  }]);