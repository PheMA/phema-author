/* global Kinetic */

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

    function addConnectionHandler(kineticObj) {
      var stage = $scope.canvasDetails.kineticStageObj;
      kineticObj.on('mouseup', function (e) {
        endConnector(stage, e.target);
      });
      kineticObj.on('mousemove', function(evt) {
        updateActiveLineLocation(stage, evt);
      });
      kineticObj.on('mousedown', function (e) {
        endConnector(stage, undefined);  // Make sure it's not carrying over from before
        startConnector(stage, e.target);
      });
    }

    function addStandardEventHandlers(kineticObj) {
      var stage = $scope.canvasDetails.kineticStageObj;
      kineticObj.on('mousemove', function(evt) {
        updateActiveLineLocation(stage, evt);
      });
      kineticObj.on('mouseup', function(evt) {
        endConnector(stage, undefined);
      });
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
          e.target.getParent().draw();
      });
      kineticObj.on('mouseout', function (e) {
          e.target.setStrokeWidth(1);
          e.target.getParent().draw();
      });
    }

    function createText(options, group) {
      if ('undefined' === typeof options.text || '' === options.text) {
        options.text = 'New Item';
      }

      var kineticObj = new Kinetic.Text(options);
      //addCursorStyles(kineticObj);
      addStandardEventHandlers(kineticObj);
      group.add(kineticObj);
      return kineticObj;
    }

    function createRectangle(options, group) {
      var kineticObj = new Kinetic.Rect(options);
      //addCursorStyles(kineticObj);
      addStandardEventHandlers(kineticObj);
      group.add(kineticObj);
      return kineticObj;
    }

    function createCircle(options, group) {
      var kineticObj = new Kinetic.Circle(options);
      //addCursorStyles(kineticObj);
      group.add(kineticObj);
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
          x: ((config && config.x) ? config.x : 50), y: ((config && config.y) ? config.y : 50),
          width: 175, height: 200,
          fill: '#dbeef4',
          stroke: 'black', strokeWidth: 1
      };

      var group = new Kinetic.Group({draggable: true});
      addCursorStyles(group);
      var workflowObj = createRectangle(options, group);
      group.on('dragmove', function(e) {
        // e.target is assumed to be a Group
        if (e.target.nodeType !== 'Group') {
          console.error('Unsupported object' + e.target);
          return;
        }

        // For the element we are moving, redraw all connection lines
        var connector = e.target.find('.rightConnector')[0];
        var stage = group.getStage();
        var i = 0;
        for (i = connector.connections.length - 1; i >= 0; i--) {
          var line = connector.connections[i];
          if (line.connectors.start === connector) {
            line.setAbsolutePosition(connector.getAbsolutePosition());
            var startPos = {x: line.getPoints()[0], y: line.getPoints()[1]};
            var endPos = {
              x: line.connectors.end.getAbsolutePosition().x - line.connectors.start.getAbsolutePosition().x,
              y: line.connectors.end.getAbsolutePosition().y - line.connectors.start.getAbsolutePosition().y,
            };
            changeLineEndpoints(stage, line, startPos, endPos);
          }
          else {
          }
        };
        stage.draw();
      });

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Calibri', fontSize: 14, fill: 'black',
          text: config.element.name,
          align: 'center', padding: 5
      };
      var headerObj = createText(headerOptions, group);

      var termDropOptions = {
        x: options.x + 10, y: headerObj.height() + headerOptions.y + 5,
        width: options.width - 20, height: 75,
        fill: '#EEEEEE',
        stroke: '#CCCCCC', strokeWidth: 1
      };
      var termObj = createRectangle(termDropOptions, group);
      var termTextOptions = {
        x: termDropOptions.x, y: termDropOptions.y,
        width: termObj.width(), height: termObj.height(),
        fontFamily: 'Calibri', fontSize: 14, fill: 'gray',
        text: 'Drag and drop clinical terms or value sets here, or search for terms',
        align: 'center', padding: 5
      };
      createText(termTextOptions, group);

      var configOptions = {
        x: termDropOptions.x, y: termObj.height() + termDropOptions.y + 5,
        width: termDropOptions.width, height: termDropOptions.height,
        fill: '#EEEEEE',
        stroke: '#CCCCCC', strokeWidth: 1
      };
      var configObj = createRectangle(configOptions, group);


      // Resize the main container to ensure consistent spacing regardless of the
      // height of internal components.
      workflowObj.setHeight(configObj.getY() + configObj.getHeight() - options.y + 10);

      var leftConnectOptions = {
        x: options.x, y: options.y + (workflowObj.getHeight() / 2),
        width: 15, height: 15,
        fill: 'white', name: 'leftConnector',
        stroke: 'black', strokeWidth: 1
      };
      var leftObj = createCircle(leftConnectOptions, group);
      addOutlineStyles(leftObj);
      addConnectionHandler(leftObj);
      leftObj.connections = [];

      var rightConnectOptions = {
        x: options.x + options.width, y: options.y + (workflowObj.getHeight() / 2),
        width: 15, height: 15,
        fill: 'white', name: 'rightConnector',
        stroke: 'black', strokeWidth: 1
      };
      var rightObj = createCircle(rightConnectOptions, group);
      addOutlineStyles(rightObj);
      addConnectionHandler(rightObj);
      rightObj.connections = [];

      var mainLayer = $scope.canvasDetails.kineticStageObj.find('#mainLayer');
      mainLayer.add(group);
      mainLayer.draw();

      return workflowObj;
    };
  }]);
