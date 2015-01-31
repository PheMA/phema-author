'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ValueSetPropertiesController
 * @description
 * # ValueSetPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('ValueSetPropertiesController', ['$scope', '$modalInstance', 'ValueSetService', 'valueSet', function ($scope, $modalInstance, ValueSetService, valueSet) {
    $scope.valueSet = valueSet;
    $scope.members = [];
    ValueSetService.loadMembers()
      .then(ValueSetService.processMembers)
      .then(function(members) { $scope.members = members; });

    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
