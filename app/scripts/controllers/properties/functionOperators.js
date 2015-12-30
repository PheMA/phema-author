'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:FunctionPropertiesController
 * @description
 * # FunctionPropertiesController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('FunctionPropertiesController', ['$scope', '$modalInstance', 'FunctionService', 'element', 'containedElements', 'functions', function ($scope, $modalInstance, FunctionService, element, containedElements, functions) {
    $scope.functions = functions;
    $scope.selectedFunction = ArrayUtil.findInArray($scope.functions, 'name', element.name);
    $scope.containedElements = containedElements;

    $scope.ok = function () {
      $modalInstance.close($scope.selectedFunction);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
