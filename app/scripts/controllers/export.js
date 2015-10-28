'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ExportPhenotypeController
 * @description
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('ExportPhenotypeController', ['$scope', '$modalInstance', '$timeout', 'ExporterService', 'phenotype', 'exporter', function ($scope, $modalInstance, $timeout, ExporterService, phenotype, exporter) {
    $scope.phenotype = phenotype;
    $scope.exporter = exporter;
    $scope.state = 'initializing';
    $scope.exportData = null;
    $scope.cancelled = false;

    function handleError() {
      $scope.exportData = null;
      $scope.state = 'error';
    }

    function cancelDialog() {
      $scope.cancelled = true;
      $modalInstance.dismiss('cancel');
    }

    function pollForResponse() {
      $timeout(function () {
          ExporterService.getStatus($scope.exportData.id)
          .then(function(status) {
            if (!$scope.cancelled) {
              if (status.status === 'processing') {
                pollForResponse();
              }
              else if (status.status === 'completed') {
                $scope.state = 'completed';
              }
            }
          })
          .catch(handleError);
        }, 2000);
    }

    ExporterService.run(exporter.id, phenotype)
      .then(function (exportData) {
        $scope.exportData = exportData;
        $scope.state = 'exporting';
        pollForResponse();
      })
      .catch(handleError);

    $scope.cancel = cancelDialog;
  }]);
