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

    //$scope.connectionStatus = '';

    function addConnectionHandler(kineticObj) {
      var stage = $scope.canvasDetails.kineticStageObj;
      kineticObj.on('mouseup', function (e) {
        if (stage.connectionStatus === 'drawing') {
          stage.connectionStatus = undefined;
          stage.activeLine = undefined;
          e.target.getLayer().draggable(true);
        }
      });

      kineticObj.on('mousedown', function (e) {
        if (stage.connectionStatus === 'drawing') {
          stage.connectionStatus = undefined;
          stage.activeLine = undefined;
          e.target.getLayer().draggable(true);
        }
        else {
          var layer = new Kinetic.Layer({draggable: true});
          var line = new Kinetic.Line({
            x: stage.getPointerPosition().x,
            y: stage.getPointerPosition().y,
            points: [0, 0],
            stroke: 'black', strokeWidth: 1
           });
           layer.add(line);
           stage.add(layer);
           layer.setZIndex(999);  // Should be on top
           stage.connectionStatus = 'drawing';
           stage.activeLine = line;
           line.parent.draw();
           e.target.getLayer().draggable(false);
        }
      });
      //   if (e.target.parent.connectionStatus === 'drawing') {
      //     e.target.parent.connectionStatus = undefined;
      //     e.target.parent.activeLine = undefined;
      //   }
      //   else {
      //     var line = new Kinetic.Line({
      //       x: e.target.getX(),
      //       y: e.target.getY(),
      //       points: [0, 0],
      //       stroke: 'black'
      //     });
      //     e.target.parent.add(line);
      //     e.target.parent.connectionStatus = 'drawing';
      //     e.target.parent.activeLine = line;
      //     e.target.parent.draw();
      //   }
      // });

      // kineticObj.parent.on('mousemove', function(e) {
      //   if (e.target.parent.connectionStatus === 'drawing') {
      //     var line = e.target.parent.activeLine;
      //     var layer = e.target.parent;
      //     line.points([0, 0, e.evt.layerX - line.getX(), e.evt.layerY - line.getY()]);
      //     layer.draw();
      //   }
      // });
    }

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

    function addOutlineStyles(kineticObj) {
      kineticObj.on('mouseover', function (e) {
          e.target.setStrokeWidth(3);
          e.target.parent.draw();
      });
      kineticObj.on('mouseout', function (e) {
          e.target.setStrokeWidth(1);
          e.target.parent.draw();
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
          fill: '#dbeef4',
          stroke: 'black', strokeWidth: 1
      };

      var layer = new Kinetic.Layer({draggable: true});
      var workflowObj = createRectangle(options, layer);

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Calibri', fontSize: 14, fill: 'black',
          text: config.element.name,
          align: 'center', padding: 5
      };
      var headerObj = createText(headerOptions, layer);

      var termDropOptions = {
        x: options.x + 10, y: headerObj.height() + headerOptions.y + 5,
        width: options.width - 20, height: 75,
        fill: '#EEEEEE',
        stroke: '#CCCCCC', strokeWidth: 1
      };
      var termObj = createRectangle(termDropOptions, layer);
      var termTextOptions = {
        x: termDropOptions.x, y: termDropOptions.y,
        width: termObj.width(), height: termObj.height(),
        fontFamily: 'Calibri', fontSize: 14, fill: 'gray',
        text: 'Drag and drop clinical terms or value sets here, or search for terms',
        align: 'center', padding: 5
      };
      createText(termTextOptions, layer);

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
      var leftObj = createCircle(leftConnectOptions, layer);
      addOutlineStyles(leftObj);
      addConnectionHandler(leftObj);

      var rightConnectOptions = {
        x: options.x + options.width, y: options.y + (workflowObj.getHeight() / 2),
        width: 15, height: 15,
        fill: 'white',
        stroke: 'black', strokeWidth: 1
      };
      var rightObj = createCircle(rightConnectOptions, layer);
      addOutlineStyles(rightObj);
      addConnectionHandler(rightObj);

      $scope.canvasDetails.kineticStageObj.add(layer);

      return workflowObj;
    };
  }]);
