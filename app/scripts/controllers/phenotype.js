'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypectrlCtrl
 * @description
 * # PhenotypectrlCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypeCtrl', function ($scope) {
    $scope.addKineticElement = function () {
        var layer = new Kinetic.Layer();
        var rectX = $scope.canvasDetails.kineticStageObj.getWidth() / 2 - 50;
        var rectY = $scope.canvasDetails.kineticStageObj.getHeight() / 2 - 25;

        //if kineticObj is null, init
        var options = {
            x: rectX,
            y: rectY,
            width: 100,
            height: 50,
            fill: '#00D2FF',
            stroke: 'black',
            strokeWidth: 4,
        };
        if ($scope.canvasDetails.isdraggable) {
            options.draggable = true;
        }

        var kineticObj = new Kinetic.Rect(options);

        // add cursor styling
        kineticObj.on('mouseover', function () {
            document.body.style.cursor = 'pointer';
        });
        kineticObj.on('mouseout', function () {
            document.body.style.cursor = 'default';
            $scope.$emit('CANVAS-MOUSEOUT');
        });

        layer.add(kineticObj);
        $scope.canvasDetails.kineticStageObj.add(layer);
    };
  });
