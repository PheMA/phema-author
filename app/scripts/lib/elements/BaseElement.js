'use strict';

var BaseElement = function() {};

BaseElement.prototype = {
  _init: function() {
  },

  addConnectionHandler: function(kineticObj, scope) {
    var stage = scope.canvasDetails.kineticStageObj;
    kineticObj.on('mouseup', function (e) {
      endConnector(stage, e.target, scope);
    });
    kineticObj.on('mousemove', function(evt) {
      updateActiveLineLocation(stage, evt);
    });
    kineticObj.on('mousedown', function (e) {
      endConnector(stage, undefined, scope);  // Make sure it's not carrying over from before
      startConnector(stage, e.target);
    });
  },

  addStandardEventHandlers: function(kineticObj, scope) {
    var stage = scope.canvasDetails.kineticStageObj;
    kineticObj.on('mousemove', function(evt) {
      updateActiveLineLocation(stage, evt);
    });
    kineticObj.on('mouseup', function() {
      endConnector(stage, undefined, scope);
      clearSelections(stage);
      selectObject(stage, kineticObj, scope);
    });

    // When we are dragging, move the drag object to be the top element, clear all
    // other selections, and then visually select the dragging element.
    kineticObj.on('dragstart', function() {
      kineticObj.setZIndex(999);
      clearSelections(stage);
      selectObject(stage, kineticObj, scope);
      kineticObj.draw();
    });

    this.setDraggable(kineticObj, scope);
  },

  addCursorEventHandlers: function(kineticObj, scope) {
    // add cursor styling
    kineticObj.on('mouseover', function () {
        document.body.style.cursor = 'pointer';
    });
    kineticObj.on('mouseout', function () {
        document.body.style.cursor = 'default';
        scope.$emit('CANVAS-MOUSEOUT');
    });
  },

  // Sets up a Kinetic shape to be a droppable target that accepts an array of types that
  // can be dropped on it.
  setDroppable: function(kineticObj, allowedDropTypes) {
    kineticObj.droppable = true;
    kineticObj.droppableElementTypes = allowedDropTypes;
  },

    // Adds appropriate event handlers to a draggable object.
    // Idea for temp layer so we can use getIntersection courtesy of: http://jsbin.com/pecor/3/edit?html,js,output
  setDraggable: function(kineticObj, scope) {
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
      dragItem.moveTo(stage.mainLayer); // Must do this before remove element
      removeElementFromContainer(stage, dragItem);  // Clear from a container, if it was in one before
      document.body.style.cursor = 'default';
      if (highlightedDrop) {
        if (allowsDrop(dragItem, highlightedDrop)) {
          addElementToContainer(stage, highlightedDrop, dragItem);
        }
        updateStrokeWidth(highlightedDrop, true);
        highlightedDrop = null;
        stage.mainLayer.draw();
      }
    });
  },

  createText: function (options, group) {
    if ('undefined' === typeof options.text || '' === options.text) {
      options.text = 'New Item';
    }

    var kineticObj = new Kinetic.Text(options);
    group.add(kineticObj);
    return kineticObj;
  },

  createRectangle: function (options, group) {
    var kineticObj = new Kinetic.Rect(options);
    group.add(kineticObj);
    kineticObj.originalStrokeWidth = options.strokeWidth;
    return kineticObj;
  },

  createConnector: function (options, group) {
    var kineticObj = new Kinetic.PhemaConnector(options);
    group.add(kineticObj);
    kineticObj.originalStrokeWidth(options.strokeWidth);
    return kineticObj;
  },

  connectConnectorEvents: function (group) {
    group.on('dragmove', function(e) {
      // e.target is assumed to be a Group
      if (e.target.nodeType !== 'Group') {
        console.error('Unsupported object' + e.target);
        return;
      }

      // For the element we are moving, redraw all connection lines
      var stage = group.getStage();
      console.log(e.target.find('.rightConnector'));
      updateConnectedLines(e.target.find('.rightConnector')[0], stage);
      updateConnectedLines(e.target.find('.leftConnector')[0], stage);
      stage.find('#mainLayer').draw();
    });
  },

  addConnectors: function (scope, mainRect, group, trackDrag) {
    trackDrag = (typeof trackDrag !== 'undefined') ? trackDrag : true;

    var leftConnectOptions = {
      x: mainRect.getX(), y: (mainRect.getHeight() / 2),
      width: 15, height: 15,
      fill: 'white', name: 'leftConnector',
      stroke: 'black', strokeWidth: 1
    };
    var leftObj = this.createConnector(leftConnectOptions, group);
    addOutlineStyles(leftObj);
    leftObj.connections([]);

    var rightConnectOptions = {
      x: mainRect.getX() + mainRect.getWidth(), y: (mainRect.getHeight() / 2),
      width: 15, height: 15,
      fill: 'white', name: 'rightConnector',
      stroke: 'black', strokeWidth: 1
    };
    var rightObj = this.createConnector(rightConnectOptions, group);
    addOutlineStyles(rightObj);
    rightObj.connections([]);

    if (trackDrag) {
      this.connectConnectorEvents(group);
    }

    return [leftObj, rightObj];
  },

  // When we load a saved phenotype definition, we have references to other elements.  This
  // method goes through and associates those references back to actual elements.
  associateReferences: function(group, scope) {
    var connections = scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection');
    group.find('PhemaConnector').each(function(connector) {
      var connectionRefs = connector.connections();
      var newConnections = [];
      for (var refIndex = 0; refIndex < connectionRefs.length; refIndex++) {
        for (var index = 0; index < connections.length; index++) {
          if (connections[index]._id === connectionRefs[refIndex].id) {
            newConnections.push(connections[index]);

            // We have a bi-directional reference between connectors and connections, so we
            // weill update the connector references here since we have estabilshed a connection.
            // Determine if I'm the start or the end of the connection
            var connectorRef = connections[index].connectors();
            if (connector._id === connectorRef.start.id) {
              connectorRef.start = connector;
            }
            else if (connector._id === connectorRef.end.id) {
              connectorRef.end = connector;
            }
            else {
              console.log('Invalid connection was found');
            }
            connections[index].connectors(connectorRef);
            break;
          }
        }
      }
      connector.connections(newConnections);
    });

    // Now, loop through all of the Connections and associate the appropriate Label with them
    var labels = scope.canvasDetails.kineticStageObj.mainLayer.find('Text');
    connections.each(function(connection) {
      var labelRef = connection.label();
      for (var labelIndex = 0; labelIndex < labels.length; labelIndex++) {
        if (labels[labelIndex]._id === labelRef.id) {
          connection.label(labels[labelIndex]);
          break;
        }
      }
    });
  }
};