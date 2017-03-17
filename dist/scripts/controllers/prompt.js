'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PromptController
 * @description
 * # PromptController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PromptController', ['$scope', '$uibModalInstance', 'title', 'message', 'buttons', function ($scope, $uibModalInstance, title, message, buttons) {
    $scope.title = title;
    $scope.message = message;
    $scope.buttons = buttons;

    $scope.buttonPressed = function (id) {
      $uibModalInstance.close(id);
    };
  }]);