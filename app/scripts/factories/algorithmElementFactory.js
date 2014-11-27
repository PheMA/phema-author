'use strict';
/* globals endConnector, updateActiveLineLocation, startConnector, clearSelections, selectObject, changeConnectorEndpoints, addOutlineStyles, updateStrokeWidth, Kinetic, getIntersectingShape, addElementToContainer */

angular.module('sophe.factories.algorithmElement', [])
  .factory('algorithmElementFactory', function() {
    function addConnectionHandler(kineticObj, scope) {
      var stage = scope.canvasDetails.kineticStageObj;
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

    function addStandardEventHandlers(kineticObj, scope) {
      var stage = scope.canvasDetails.kineticStageObj;
      kineticObj.on('mousemove', function(evt) {
        updateActiveLineLocation(stage, evt);
      });
      kineticObj.on('mouseup', function() {
        endConnector(stage, undefined);
        clearSelections(stage);
        selectObject(stage, kineticObj);
      });

      // When we are dragging, move the drag object to be the top element, clear all
      // other selections, and then visually select the dragging element.
      kineticObj.on('dragstart', function() {
        kineticObj.setZIndex(999);
        clearSelections(stage);
        selectObject(stage, kineticObj);
        kineticObj.draw();
      });

      setDraggable(kineticObj, scope);
    }

    function addCursorStyles(kineticObj, scope) {
      // add cursor styling
      kineticObj.on('mouseover', function () {
          document.body.style.cursor = 'pointer';
      });
      kineticObj.on('mouseout', function () {
          document.body.style.cursor = 'default';
          scope.$emit('CANVAS-MOUSEOUT');
      });
    }

    // Sets up a Kinetic shape to be a droppable target that accepts an array of types that
    // can be dropped on it.
    function setDroppable(kineticObj, allowedDropTypes) {
      kineticObj.droppable = true;
      kineticObj.droppableElementTypes = allowedDropTypes;
    }

    // Adds appropriate event handlers to a draggable object.
    // Idea for temp layer so we can use getIntersection courtesy of: http://jsbin.com/pecor/3/edit?html,js,output
    function setDraggable(kineticObj, scope) {
      var stage = scope.canvasDetails.kineticStageObj;
      var highlightedDrop = null;

      var dragItem = kineticObj;
      if ('Group' !== kineticObj.nodeType) {
        dragItem = kineticObj.getParent();
      }

      dragItem.on('dragstart',function(){
        dragItem.moveTo(stage.tempLayer);
        Kinetic.DD.isDragging = false;
        stage.mainLayer.draw();
        Kinetic.DD.isDragging = true;
        var dd = Kinetic.DD;
        dd.anim.stop();
        dd.anim.setLayers(stage.tempLayer);
        dd.anim.start();
      });

      dragItem.on('dragmove',function(e){
        var pos = stage.getPointerPosition();
        // We can't use the KineticJS getIntersection because when we are moving the mouse we
        // need to redraw the different layers to account for connector arrows moving.  Because
        // we do the redraw, it invalidates the underlying image that getIntersections relies on.
        var shape = getIntersectingShape(stage.mainLayer, pos);
        if (!shape) {
          // If we don't have a spot to drop, but we did before, clean up the old shape so it's not
          // still highlighted as an active drop target.
          if (highlightedDrop) {
            updateStrokeWidth(highlightedDrop, true);
            highlightedDrop.getParent().draw();
            highlightedDrop = null;
          }
          document.body.style.cursor = 'default';
          return;
        }

        if (shape.droppable && shape !== highlightedDrop) {
          if (!allowsDrop(e.target, shape)) {
            document.body.style.cursor = 'no-drop';
          }

          if (highlightedDrop) {
            updateStrokeWidth(highlightedDrop, true);
          }
          highlightedDrop = shape;
          updateStrokeWidth(shape, false);
          highlightedDrop.getParent().draw();
        }
      });

      dragItem.on('dragend',function(){
        var pos = stage.getPointerPosition();
        dragItem.moveTo(stage.mainLayer); // Must do this before remove element
        removeElementFromContainer(stage, dragItem);  // Clear from a container, if it was in one before
        document.body.style.cursor = 'default';
        if (highlightedDrop) {
          addElementToContainer(stage, highlightedDrop, dragItem);
          updateStrokeWidth(highlightedDrop, true);
          highlightedDrop = null;
          stage.mainLayer.draw();
        }
      });
    }

    function createText(options, group) {
      if ('undefined' === typeof options.text || '' === options.text) {
        options.text = 'New Item';
      }

      var kineticObj = new Kinetic.Text(options);
      group.add(kineticObj);
      return kineticObj;
    }

    function createRectangle(options, group) {
      var kineticObj = new Kinetic.Rect(options);
      group.add(kineticObj);
      kineticObj.originalStrokeWidth = options.strokeWidth;
      return kineticObj;
    }

    function createCircle(options, group) {
      var kineticObj = new Kinetic.Circle(options);
      group.add(kineticObj);
      kineticObj.originalStrokeWidth = options.strokeWidth;
      return kineticObj;
    }

    function updateConnectedLines(connector, stage) {
      var i = 0;
      for (i = connector.connections.length - 1; i >= 0; i--) {
        var line = connector.connections[i];
        var startPos = {};
        var endPos = {};
        if (line.connectors.start === connector) {
          line.setAbsolutePosition(connector.getAbsolutePosition());
        }

        startPos = {x: line.getPoints()[0], y: line.getPoints()[1]};
        endPos = {
          x: line.connectors.end.getAbsolutePosition().x - line.connectors.start.getAbsolutePosition().x,
          y: line.connectors.end.getAbsolutePosition().y - line.connectors.start.getAbsolutePosition().y,
        };
        changeConnectorEndpoints(stage, line, startPos, endPos);
      }
    }
    
    function addConnectors(scope, mainRect, group) {
      var leftConnectOptions = {
        x: 0, y: (mainRect.getHeight() / 2),
        width: 15, height: 15,
        fill: 'white', name: 'leftConnector',
        stroke: 'black', strokeWidth: 1
      };
      var leftObj = createCircle(leftConnectOptions, group);
      addOutlineStyles(leftObj);
      addConnectionHandler(leftObj, scope);
      leftObj.connections = [];

      var rightConnectOptions = {
        x: mainRect.getWidth(), y: (mainRect.getHeight() / 2),
        width: 15, height: 15,
        fill: 'white', name: 'rightConnector',
        stroke: 'black', strokeWidth: 1
      };
      var rightObj = createCircle(rightConnectOptions, group);
      addOutlineStyles(rightObj);
      addConnectionHandler(rightObj, scope);
      rightObj.connections = [];
      
      group.on('dragmove', function(e) {
        // e.target is assumed to be a Group
        if (e.target.nodeType !== 'Group') {
          console.error('Unsupported object' + e.target);
          return;
        }

        // For the element we are moving, redraw all connection lines
        var stage = group.getStage();
        updateConnectedLines(e.target.find('.rightConnector')[0], stage);
        updateConnectedLines(e.target.find('.leftConnector')[0], stage);
        stage.find('#mainLayer').draw();
      });
    }

    function createQDMDataElement(config, scope) {
      var options = {
          x: 0, y: 0, width: 175, height: 200,
          fill: '#dbeef4', name: 'mainRect',
          stroke: 'black', strokeWidth: 1
      };

      var group = new Kinetic.Group({
        draggable: true,
        x: ((config && config.x) ? config.x : 50),
        y: ((config && config.y) ? config.y : 50)});
      addStandardEventHandlers(group, scope);
      addCursorStyles(group, scope);

      var workflowObj = createRectangle(options, group);

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
      setDroppable(termObj, ['ValueSet', 'Term', 'Phenotype']);

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

      addConnectors(scope, workflowObj, group);

      // Now that the shape is built, define the bounds of the group
      group.setWidth(workflowObj.getWidth());
      group.setHeight(workflowObj.getHeight());

      var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
      mainLayer.add(group);
      mainLayer.draw();

      return group;
    }

    function createQDMTemporalOperator(config, scope) {
      var group = new Kinetic.Group({
        draggable: true,
        x: ((config && config.x) ? config.x : 50),
        y: ((config && config.y) ? config.y : 50)});
      var spacing = 75;
      addStandardEventHandlers(group, scope);
      addCursorStyles(group, scope);

      var options = {
          x: 0, y: 0, width: 175, height: 175,
          fill: 'white', name: 'eventA',
          stroke: 'gray', strokeWidth: 1
      };
      var eventA = createRectangle(options, group);
      eventA.dash([10, 5]);
      eventA.dashEnabled(true);
      setDroppable(eventA, ['Category', 'DataElement', 'LogicalOperator', 'Phenotype']);

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Calibri', fontSize: 18, fill: 'black',
          text: 'Event A',
          align: 'center', padding: 5
      };
      var eventAText = createText(headerOptions, group);
      createText({
        x: eventAText.getX(), y: eventAText.getY() + eventAText.getHeight() + 25,
        width: options.width, // Leave out height so it auto-sizes
        fontFamily: 'Calibri', fontSize: 14, fill: 'black',
        text: '(Drag and drop a data element here to define the event)',
        align: 'center', padding: 5}, group);

      options.x = options.x + options.width + spacing;
      var eventB = createRectangle(options, group);
      eventB.dash([10, 5]);
      eventB.dashEnabled(true);
      setDroppable(eventB, ['Category', 'DataElement', 'LogicalOperator', 'Phenotype']);

      headerOptions.x = options.x;
      headerOptions.y = options.y;
      headerOptions.text = 'Event B';
      var eventBText = createText(headerOptions, group);
      createText({
        x: eventBText.getX(), y: eventBText.getY() + eventBText.getHeight() + 25,
        width: options.width, // Leave out height so it auto-sizes
        fontFamily: 'Calibri', fontSize: 14, fill: 'black',
        text: '(Drag and drop a data element here to define the event)',
        align: 'center', padding: 5}, group);

      var stage = scope.canvasDetails.kineticStageObj;
      var line = new Kinetic.Line({
        x: eventA.getX() + eventA.getWidth(),
        y: eventA.getY() + eventA.getHeight() / 2,
        points: [0, 0],
        stroke: 'black', strokeWidth: 2
      });
      group.add(line);
      changeConnectorEndpoints(stage, line, {x: 0, y: 0}, {x: spacing, y: 0});

      // Now that the shape is built, define the bounds of the group
      group.setWidth(eventB.getX() + eventB.getWidth() - eventA.getX());
      group.setHeight(eventA.getHeight());

      var mainLayer = stage.find('#mainLayer');
      mainLayer.add(group);
      mainLayer.draw();
      return group;
    }

    function createQDMLogicalOperator(config, scope) {
      var options = {
          x: 0, y: 0, width: 200, height: 200,
          fill: '#eeeeee', name: 'mainRect',
          stroke: 'gray', strokeWidth: 1
      };

      var group = new Kinetic.Group({
        draggable: true,
        x: ((config && config.x) ? config.x : 50),
        y: ((config && config.y) ? config.y : 50),
        width: options.width, height: options.height });
      addStandardEventHandlers(group, scope);
      addCursorStyles(group, scope);

      var workflowObj = createRectangle(options, group);
      workflowObj.dash([10, 5]);
      workflowObj.dashEnabled(true);
      setDroppable(workflowObj, ['Category', 'DataElement', 'LogicalOperator']);

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Calibri', fontSize: 14, fill: 'black',
          text: config.element.name, name: 'header',
          align: 'center', padding: 5
      };
      createText(headerOptions, group);
      
      addConnectors(scope, workflowObj, group);

      group.containedElements = [];
      var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
      mainLayer.add(group);
      mainLayer.draw();
      return group;
    }

    function createGenericElement(config, scope) {
      var options = {
          x: 0, y: 0, width: 175, height: 100,
          fill: '#dbeef4', name: 'mainRect',
          stroke: 'black', strokeWidth: 1
      };

      var group = new Kinetic.Group({
        draggable: true,
        x: ((config && config.x) ? config.x : 50),
        y: ((config && config.y) ? config.y : 50)});
      addStandardEventHandlers(group, scope);
      addCursorStyles(group, scope);
      var workflowObj = createRectangle(options, group);

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Calibri', fontSize: 14, fill: 'black',
          text: config.element.name,
          align: 'center', padding: 5
      };
      var headerObj = createText(headerOptions, group);

      workflowObj.setHeight(headerObj.getHeight() + 30);

      // Now that the shape is built, define the bounds of the group
      group.setWidth(workflowObj.getWidth());
      group.setHeight(workflowObj.getHeight());
      
      addConnectors(scope, workflowObj, group);

      var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
      mainLayer.add(group);
      mainLayer.draw();
      return group;
    }

    // Determines if an element being dragged can be dropped onto another element
    function allowsDrop(dragElement, dropElement) {
      if (!dragElement || !dropElement) {
        console.error('No drag or drop element was specified');
        return false;
      }

      if (!dropElement.droppable || (!dropElement.droppableElementTypes) || dropElement.droppableElementTypes.length === 0) {
        console.error('This element is not configured to accept drops');
        return false;
      }

      var index = 0;
      for (index = 0; index < dropElement.droppableElementTypes.length; index++) {
        if (dropElement.droppableElementTypes[index] === dragElement.element.type) {
          return true;
        }
      }

      return false;
    }

    var factory = {};
    factory.addWorkflowObject = function (config, scope) {
      // If there is no canvas to add to, we are done here
      if('undefined' === typeof scope.canvasDetails) {
        console.error('No canvas is defined');
        return null;
      }

      if ('undefined' === typeof(config) || null === config || !config.element) {
        console.error('No element definition was provided');
        return null;
      }

      var workflowObject = null;
      if (config.element.type === 'TemporalOperator') {
        workflowObject = createQDMTemporalOperator(config, scope);
      }
      else if (config.element.type === 'DataElement' || config.element.type === 'Category') {
        workflowObject = createQDMDataElement(config, scope);
      }
      else if (config.element.type === 'LogicalOperator') {
        workflowObject = createQDMLogicalOperator(config, scope);
      }
      else if (config.element.type === 'Phenotype') {
        workflowObject = createGenericElement(config, scope);
      }
      else {
        workflowObject = createGenericElement(config, scope);
      }

      if (workflowObject) {
        workflowObject.element = config.element;
      }

      return workflowObject;
    };

    factory.deleteSelectedObjects = function(scope) {
      // If there is no canvas to remove from, we are done here
      if('undefined' === typeof scope.canvasDetails) {
          return null;
      }

      var stage = scope.canvasDetails.kineticStageObj;
      stage.mainLayer.get('Group').each(function(group) {
        if (group.selected === true) {
          group.destroy();
        }
      });
      stage.draw();
    };

    factory.allowsDrop = allowsDrop;

    return factory;
});