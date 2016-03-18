'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ResultValueController
 * @description
 * # ResultValueController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('ResultValueController', ['$scope', 'UnitService', function ($scope, UnitService) {
    $scope.units = [];

    UnitService.load()
      .then(UnitService.processValues)
      .then(function(units) {
        $scope.units = units;
      });
  }]);