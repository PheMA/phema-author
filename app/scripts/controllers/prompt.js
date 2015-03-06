'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PromptController
 * @description
 * # PromptController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PromptController', ['$scope', '$modalInstance', 'title', 'message', 'buttons', function ($scope, $modalInstance, title, message, buttons) {
    $scope.title = title;
    $scope.message = message;
    $scope.buttons = buttons;

    $scope.buttonPressed = function (id) {
      $modalInstance.close(id);
    };
  }]);