'use strict';

/**
 * @ngdoc function
 * @name sopheAuthorApp.controller:PhenotypectrlCtrl
 * @description
 * # PhenotypectrlCtrl
 * Controller of the sopheAuthorApp
 */
angular.module('sopheAuthorApp')
  .controller('PhenotypeCtrl', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
    $scope.phenotype = $routeParams.id;
    // $scope.dataElements = [
    //     {name: "Care Experience"},
    //     {name: "Care Goal"}
    // ];
    $http.get('data/qdm-elements.json').success (function(data){
        var transformedData = [];
        var originalData = data.results.bindings;
        for (var index = 0; index < originalData.length; index++) {
            if (originalData[index].context.value == "http://rdf.healthit.gov/qdm/element#qdm-4-1") {
                transformedData.push({ name: originalData[index].datatypeLabel.value} );
            }
        };
        $scope.dataElements = transformedData.sort(function(obj1, obj2) {
            return obj1.name.localeCompare(obj2.name);
        });
    });

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
  }]);
