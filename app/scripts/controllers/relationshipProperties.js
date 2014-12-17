'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:RelationshipPropertiesCtrl
 * @description
 * # RelationshipPropertiesCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('RelationshipPropertiesCtrl', function ($scope, $modalInstance, element) {
    $scope.element = element;
    $scope.ok = function () {
      console.log(element);
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
