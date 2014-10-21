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

    $http.get('data/phenotypes.json').success (function(data) {
      $scope.phenotypes = data.sort(function(obj1, obj2) {
        return obj1.name.localeCompare(obj2.name);
        });
    });

    $http.get('data/qdm-elements.json').success (function(data){
      $scope.dataElements = [];
      if (data && data.results) {
        var transformedData = [];
        var originalData = data.results.bindings;
        for (var index = 0; index < originalData.length; index++) {
            if (originalData[index].context.value === 'http://rdf.healthit.gov/qdm/element#qdm-4-1') {
                transformedData.push({ name: originalData[index].datatypeLabel.value} );
            }
        }
        $scope.dataElements = transformedData.sort(function(obj1, obj2) {
            return obj1.name.localeCompare(obj2.name);
        });
      }
    });

    function addCursorStyles(kineticObj) {
      // add cursor styling
      kineticObj.on('mouseover', function () {
          document.body.style.cursor = 'pointer';
      });
      kineticObj.on('mouseout', function () {
          document.body.style.cursor = 'default';
          $scope.$emit('CANVAS-MOUSEOUT');
      });
    }

    function createText(options, layer) {
      if ('undefined' === typeof options.text || '' === options.text) {
        options.text = 'New Item';
      }

      var kineticObj = new Kinetic.Text(options);
      addCursorStyles(kineticObj);
      layer.add(kineticObj);
      return kineticObj;
    }

    function createRectangle(options, layer) {
      var kineticObj = new Kinetic.Rect(options);
      addCursorStyles(kineticObj);
      layer.add(kineticObj);
      return kineticObj;
    }

    function createCircle(options, layer) {
      var kineticObj = new Kinetic.Circle(options);
      addCursorStyles(kineticObj);
      layer.add(kineticObj);
      return kineticObj;
    }

    // config object:
    //   x
    //   y
    //   element
    $scope.addWorkflowObject = function (config) {
      // If there is no canvas to add to, we are done here
      if('undefined' === typeof $scope.canvasDetails) {
          return null;
      }

      var options = {
          x: (config ? config.x : 50), y: (config ? config.y : 50),
          width: 175, height: 200,
          fill: '#EEE2EF',
          stroke: 'black', strokeWidth: 1
      };

      var layer = new Kinetic.Layer({draggable: true});
      var workflowObj = createRectangle(options, layer);

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Arial', fontSize: 12, fill: 'black',
          text: config.element.name, align: 'center', padding: 5
      };
      var headerObj = createText(headerOptions, layer);

      var termDropOptions = {
        x: options.x + 10, y: headerObj.height() + headerOptions.y + 5,
        width: options.width - 20, height: 75,
        fill: '#EEEEEE',
        stroke: '#CCCCCC', strokeWidth: 1
      };
      var termObj = createRectangle(termDropOptions, layer);

      var configOptions = {
        x: termDropOptions.x, y: termObj.height() + termDropOptions.y + 5,
        width: termDropOptions.width, height: termDropOptions.height,
        fill: '#EEEEEE',
        stroke: '#CCCCCC', strokeWidth: 1
      };
      var configObj = createRectangle(configOptions, layer);


      // Resize the main container to ensure consistent spacing regardless of the
      // height of internal components.
      workflowObj.setHeight(configObj.getY() + configObj.getHeight() - options.y + 10);

      var leftConnectOptions = {
        x: options.x, y: options.y + (workflowObj.getHeight() / 2),
        width: 15, height: 15,
        fill: 'white',
        stroke: 'black', strokeWidth: 1
      };
      createCircle(leftConnectOptions, layer);

      var rightConnectOptions = {
        x: options.x + options.width, y: options.y + (workflowObj.getHeight() / 2),
        width: 15, height: 15,
        fill: 'white',
        stroke: 'black', strokeWidth: 1
      };
      createCircle(rightConnectOptions, layer);

      $scope.canvasDetails.kineticStageObj.add(layer);

      return workflowObject;
    };
  }]);
