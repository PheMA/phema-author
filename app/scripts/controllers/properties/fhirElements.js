'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:QDMElementsController
 * @description
 * # QDMElementsController
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('FHIRElementPropertiesController', ['$scope', '$modalInstance', 'FHIRElementService', 'element', function ($scope, $modalInstance, FHIRElementService, element) {
    $scope.element = element;
    $scope.formData = element.attributes || {};

    // Load the attributes (makes a call to the data services) and map into the dynamic form format.
    // We are assigning a promise to the form template so that it will load when the data is loaded.
    // $scope.formTemplate = { promise: QDMElementService.getAttributes(element).then(function(attributes) {
    //   var template = [];
    //   for (var index = 0; index < attributes.length; index++) {
    //     template.push(QDMAttributeService.translateQDMToForm(attributes[index]));
    //   }
    //   return template;
    // })};

    $scope.ok = function () {
      console.log($scope.formData);
      $modalInstance.close($scope.formData);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
