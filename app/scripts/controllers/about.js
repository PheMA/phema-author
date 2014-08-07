'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
