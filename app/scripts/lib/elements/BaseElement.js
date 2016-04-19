'use strict';

var BaseElement = function() {};


// Helper function used by BaseElement.getConnectedElements
// For a Connector object, determine if it's parent is the element
// parameter.  If not, add it to the list.
function _addConnectorToListIfNotElement(connector, element, list) {
  if (connector && connector.parent !== element) {
    list.push(connector.parent);
  }
}

// Helper function used by BaseElement.getConnectedElements
// For an element, look at all connected items for the connector
// identified by connectorName.  Add all connected elements to the
// elements array.
function _getConnectedElements(element, connectorName, elements, includeLabels) {
  var connector = findParentElementByName(element, connectorName);
  if (connector !== null) {
    var counter = 0;
    var connections = connector.connections();
    for (counter = 0; counter < connections.length; counter++) {
      var connectors = connections[counter].connectors();
      _addConnectorToListIfNotElement(connectors.start, element, elements);
      _addConnectorToListIfNotElement(connectors.end, element, elements);

      if (includeLabels) {
        elements.push(connections[counter]);
        elements.push(connections[counter].label());
      }
    }
  }
}

function _backgroundShouldHandleMouseEvent(obj, evt) {
  if (obj.parent && obj.parent.isSelectionRectangleActive && obj.parent.updateSelectionRectangle) {
    obj.parent.updateSelectionRectangle(evt);
    return true;
  }
  return false;
}

// Helper function that returns true/false if an element has anything
// connected to its connector identified by connectorName
function _hasConnectedElements(element, connectorName) {
  var elements = new Array;
  _getConnectedElements(element, connectorName, elements);
  return elements !== null && elements.length > 0;
}

BaseElement.prototype = {
  _init: function() {
  },

  addConnectionHandler: function(kineticObj, scope) {
    var stage = scope.canvasDetails.kineticStageObj;
    kineticObj.on('mouseup', function (evt) {
      if (_backgroundShouldHandleMouseEvent(this, evt)) {
        return;
      }
      endConnector(stage, evt.target, scope);
    });
    kineticObj.on('mousemove', function(evt) {
      if (_backgroundShouldHandleMouseEvent(this, evt)) {
        return;
      }
      updateActiveLineLocation(stage, evt);
    });
    kineticObj.on('mousedown', function (evt) {
      endConnector(stage, undefined, scope);  // Make sure it's not carrying over from before
      startConnector(stage, evt.target);
    });
  },

  addStandardEventHandlers: function(kineticObj, scope) {
    var stage = scope.canvasDetails.kineticStageObj;
    kineticObj.on('mousemove', function(evt) {
      if (_backgroundShouldHandleMouseEvent(this, evt)) {
        return;
      }
      updateActiveLineLocation(stage, evt);
    });
    kineticObj.on('mouseup', function(evt) {
      if (_backgroundShouldHandleMouseEvent(this, evt)) {
        return;
      }

      var line = endConnector(stage, undefined, scope);

      // We don't want to allow connectors to trigger selection
      var shouldSelect = false;
      if (evt && evt.target && evt.target.className !== 'PhemaConnector') {
        shouldSelect = (!line) && (kineticObj.phemaObject().isChild(evt.target));
      }

      // Only deselect existing items if the user isn't drawing a line, and the user isn't holding
      // down the shift or control keys.  This gives us the ability to select multiple items.
      var shouldDeselect = !line && evt && evt.target && !evt.evt.shiftKey && !evt.evt.ctrlKey;

      // Always clear the selection if a line was drawn, but if this is a click event we should only
      // clear the selection if we're going to be selecting a new item.
      if (line || (shouldSelect && shouldDeselect)) {
        clearSelections(stage);
      }

      // We don't want to select another object if a line is created, or if we're responding to a click
      // and the click was in some other (nested) object.
      if (shouldSelect) {
        selectObject(stage, kineticObj, scope);
      }
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
    kineticObj.on('mouseover', function (evt) {
      if (_backgroundShouldHandleMouseEvent(this, evt)) {
        return;
      }
      document.body.style.cursor = 'pointer';
    });
    kineticObj.on('mouseout', function (evt) {
      if (_backgroundShouldHandleMouseEvent(this, evt)) {
        return;
      }
      document.body.style.cursor = 'default';
    });
  },

  addSizerEventHandlers: function(kineticObj, scope) {
    var group = kineticObj.getParent();
    kineticObj.on('mouseover', function (e) {
      document.body.style.cursor = 'nwse-resize';
      e.cancelBubble = true;      // Needed for issue with KineticJS not looking at inner event
      e.evt.cancelBubble = true;
    });
    kineticObj.on('mouseout', function () {
      document.body.style.cursor = 'default';
    });
    kineticObj.on('mousedown', function() {
      group.setDraggable(false);
      kineticObj.setDraggable(true);
    });
    kineticObj.on('mouseup', function() {
      group.setDraggable(true);
      kineticObj.setDraggable(false);
    });
    kineticObj.on('dragmove', function(e) {
      var targetAbsPos = e.target.getAbsolutePosition();
      var newWidth = targetAbsPos.x - group.x() + LOGICAL_OPERATOR_SIZER_SIZE;
      var newHeight = targetAbsPos.y - group.y() + LOGICAL_OPERATOR_SIZER_SIZE;
      var minSize = group.phemaObject()._minimumSize;
      newWidth = Math.max(newWidth, minSize.width);
      newHeight = Math.max(newHeight, minSize.height);
      if (newWidth === minSize.width) {
        kineticObj.setX(minSize.width - LOGICAL_OPERATOR_SIZER_SIZE);
      }
      if (newHeight === minSize.height) {
        kineticObj.setY(minSize.height - LOGICAL_OPERATOR_SIZER_SIZE);
      }
      group.setWidth(newWidth);
      group.setHeight(newHeight);
      group.phemaObject().resizeShapeToGroup(group, scope);
      group.draw();
    });

    kineticObj.on('dragend', function(e) {
      group.setDraggable(true);
      kineticObj.setDraggable(false);
    });
  },

  // By default, an element has no capacity.  Subclasses can override this if they want to enforce
  // some type of limit.
  atCapacity: function() {
    return false;
  },

  // Sets up a Kinetic shape to be a droppable target that accepts an array of types that
  // can be dropped on it.
  setDroppable: function(kineticObj, allowedDropTypes, atCapacityFn) {
    kineticObj.droppable = true;
    kineticObj.droppableElementTypes = allowedDropTypes;
    kineticObj.atCapacity = atCapacityFn;
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

    dragItem.on('dragend',function(evt){
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
      
      resizeStageForEvent(stage, null, dragItem);
      evt.cancelBubble = true;
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
      if (e.target.nodeType !== 'Group'
        && e.target.className !== 'PhemaSizeBar') {
        console.error('Unsupported object' + e.target);
        return;
      }

      // Typically only groups can be dragged, with the exception of sizer bars.
      // We need to make sure the target group is explicitly set in that case.
      var targetGroup = e.target;
      if (e.target.className === 'PhemaSizeBar') {
        targetGroup = group;
      }

      // For the element we are moving, redraw all connection lines
      var stage = group.getStage();
      updateConnectedLines(findParentElementByName(targetGroup, 'rightConnector'), stage);
      updateConnectedLines(findParentElementByName(targetGroup, 'leftConnector'), stage);
      stage.mainLayer.draw();
    });
  },

  container: function(container) {
    if ('undefined' === typeof container) {
      return this._container;
    }
    else {
      this._container = container;
    }
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
          if (connections[index]._id === connectionRefs[refIndex]._id
            || connections[index]._id === connectionRefs[refIndex].id) {
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
  },

  // Determine if 'item' is a direct child of this base element.  This is used when we
  // have nested items in containers (where everything is a descendent) and we need to ensure
  // that an item just belongs to the object directly.
  isChild: function(item) {
    var counter = 0;
    var children = this._container.getChildren();
    for (counter = 0; counter < children.length; counter++) {
      if (children[counter] === item) {
        return true;
      }
    }

    return false;
  },

  // Return true/false if we have any elements connected to our left
  hasLeftConnectedElements: function() {
    return _hasConnectedElements(this._container, 'leftConnector');
  },

  // Return true/false if we have any elements connected to our right
  hasRightConnectedElements: function() {
    return _hasConnectedElements(this._container, 'rightConnector');
  },

  // Identify all elements that are directly connected to this element
  // on either connector (left or right)
  getConnectedElements: function(includeLabels) {
    var elements = new Array;
    _getConnectedElements(this._container, 'rightConnector', elements, includeLabels);
    _getConnectedElements(this._container, 'leftConnector', elements, includeLabels);
    return elements;
  }
};