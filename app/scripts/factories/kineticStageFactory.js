'use strict';
/* globals updateActiveLineLocation, endConnector, clearSelections, Kinetic, createSelectionRectangle, updateSelectionRectangle,
isDrawingLine, removeSelectionRectangle, highlightItemsInSelectionRectangle, Constants */

angular.module('sophe.factories.kineticStage', [])
  .factory('kineticStageFactory', function() {

    var factory = {};
    factory.create = function(scope, attrs) {
      if (!scope.canvasDetails) {
        scope.canvasDetails = {isdraggable: true, kineticStageObj: null};
        var id = attrs.id;
        //create random unique id
        if (!id) {
            id = Math.random().toString(36).substring(7);
        }
        if (!scope.canvasDetails.kineticStageObj) {
            scope.canvasDetails.kineticStageObj = new Kinetic.Stage({
                container: id,
                width: 800,
                height: 600
            });
            scope.canvasDetails.kineticStageObj.connector = {};
        }
        if (!scope.canvasDetails.kineticStageObj.container) {
            scope.canvasDetails.kineticStageObj.attrs.container = id;
        }

        // Set up a rectangle on its own layer, which will listen for mouse events for us.
        var stage = scope.canvasDetails.kineticStageObj;
        var backgroundLayer = new Kinetic.Layer({id: 'backgroundLayer', draggable: false});
        stage.add(backgroundLayer);
        stage.backgroundLayer = backgroundLayer;
        var mainLayer = new Kinetic.Layer({id: 'mainLayer'});
        stage.add(mainLayer);
        stage.mainLayer = mainLayer;
        var tempLayer = new Kinetic.Layer();
        stage.add(tempLayer);
        stage.tempLayer = tempLayer;

        var background = new Kinetic.Rect({
          x: 0,
          y: 0,
          width: stage.getWidth(),
          height: stage.getHeight(),
          fill: 'white',
          stroke: 'white',
          strokeWidth: 1,
        });
        backgroundLayer.add(background);
        backgroundLayer.draw();

        background.on('mousedown', function() {
          mainLayer.isMouseDown = true;
          mainLayer.isSelectionRectangleActive = false;
          createSelectionRectangle(stage, mainLayer);
        });

        background.on('mousemove', function(evt) {
          if (isDrawingLine(stage)) {
            updateActiveLineLocation(stage, evt);            
          }
          else if (mainLayer.isMouseDown) {
            updateSelectionRectangle(stage, mainLayer);
            highlightItemsInSelectionRectangle(stage, mainLayer);
            mainLayer.isSelectionRectangleActive = true;
          }
        });

        background.on('mouseup', function() {
          if (isDrawingLine(stage) || !mainLayer.isSelectionRectangleActive) {
            endConnector(stage, undefined, scope);
            clearSelections(stage);
          }

          removeSelectionRectangle(mainLayer);
          mainLayer.isMouseDown = false;
          mainLayer.isSelectionRectangleActive = false;
          scope.$root.$broadcast(Constants.Events.ELEMENT_SELECTED, null);
        });

        mainLayer.updateSelectionRectangle = function(evt) {
          background.fire(evt.type, evt, false);
        };
      }
    };

    return factory;
});