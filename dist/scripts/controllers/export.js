'use strict';

/* globals Constants */

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:ExportPhenotypeController
 * @description
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('ExportPhenotypeController', ['$scope', '$uibModalInstance', '$timeout', 'ExporterService', 'phenotype', 'exporter', function ($scope, $uibModalInstance, $timeout, ExporterService, phenotype, exporter) {
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
      $uibModalInstance.dismiss('cancel');
    }

    function pollForResponse() {
      $timeout(function () {
          ExporterService.getStatus($scope.exportData.id)
          .then(function(status) {
            if (!$scope.cancelled) {
              if (status.status === Constants.ExportStatuses.PROCESSING) {
                pollForResponse();
              }
              else if (status.status === Constants.ExportStatuses.COMPLETED) {
                $scope.state = 'completed';
              }
              else if (status.status === Constants.ExportStatuses.ERROR) {
                handleError();
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
