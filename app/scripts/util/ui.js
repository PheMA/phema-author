/* globals Kinetic */
/* exported startConnector, endConnector, updateActiveLineLocation, getIntersectingShape,
  addElementToContainer, removeElementFromContainer, updateConnectedLines, changeConnectorEndpoints,
  allowsDrop, findObjectInPhemaGroupType, BORDER, updateSizeOfMainRect */

'use strict';

var BORDER = 20;

function updateStrokeWidth(kineticObj, normal) {
  var strokeWidth = 1;
  if (kineticObj.originalStrokeWidth) {
    if (Kinetic.Util._isFunction(kineticObj.originalStrokeWidth)) {
      strokeWidth = kineticObj.originalStrokeWidth();
    }
    else {
      strokeWidth = kineticObj.originalStrokeWidth;
    }
  }

  if (!normal) {
    strokeWidth = strokeWidth + 2;
  }

  if ('Group' === kineticObj.nodeType) {
    var mainRect = kineticObj.find('.mainRect')[0];
    if (mainRect) {
      mainRect.setStrokeWidth(strokeWidth);
    }
  }
  else {
    kineticObj.setStrokeWidth(strokeWidth);
  }
}

function setConnectorLocation(rect, group, connectorName, x, y) {
  // If there are connectors, move them to the appropriate locations
  var connector = group.find('.' + connectorName);
  if (connector.length > 0) {
    connector.each(function(node) {
      if (node.getParent() === group) {
        node.setX(x);
        node.setY(y);
      }
    });
  }
}

function updateSizeOfMainRect(rect, group, width, height) {
  rect.setWidth(width);
  rect.setHeight(height);
  group.setWidth(width);
  group.setHeight(height);

  var y = (rect.getHeight() / 2);
  setConnectorLocation(rect, group, 'rightConnector', rect.getWidth(), y);
  setConnectorLocation(rect, group, 'leftConnector', 0, y);
}

function findObjectInPhemaGroupType(objectName, container, allowedTypes) {
  var allItems = container.find('.' + objectName);
  for (var index = 0; index < allItems.length; index++) {
    if (!allowedTypes.length) {
      var type = allowedTypes;
      allowedTypes = [type];
    }

    for (var typeIndex = 0; typeIndex < allowedTypes.length; typeIndex++) {
      if (allItems[index].parent.element().type === allowedTypes[typeIndex]) {
        return allItems[index];
      }
    }
  }

  return null;
}

function findParentElementByName(parent, elementName) {
  var elements = Kinetic.names[elementName];
  var length = elements.length;
  for (var index = 0; index < length; index++) {
    if (elements[index].getParent() === parent) {
      return elements[index];
    }
  }

  return null;
}

// Update a connector line so that it is drawn between a start position and an
// end position.
function changeConnectorEndpoints(stage, line, startPos, endPos) {
  var x = endPos.x;
  var y = endPos.y;
  line.points([0, 0, x - startPos.x, y - startPos.y]);

  // Arrow head: http://jsfiddle.net/cmcculloh/M56w4/
  var fromx = 0;
  var fromy = 0;
  var tox = x - startPos.x;
  var toy = y - startPos.y;
  var headlen = 15;
  var angle = Math.atan2(toy-fromy,tox-fromx);
  line.points(
    [fromx,
     fromy,
     tox,
     toy,
     tox-headlen*Math.cos(angle-Math.PI/6),
     toy-headlen*Math.sin(angle-Math.PI/6),
     tox,
     toy,
     tox-headlen*Math.cos(angle+Math.PI/6),
     toy-headlen*Math.sin(angle+Math.PI/6)]
  );
}

function updateConnectedLines(connector, stage) {
  var i = 0;
  var connections = connector.connections();
  for (i = connections.length - 1; i >= 0; i--) {
    var line = connections[i];
    var startPos = {};
    var endPos = {};
    var lineConnectors = line.connectors();
    if (lineConnectors.start === connector) {
      line.setAbsolutePosition(connector.getAbsolutePosition());
    }

    startPos = {x: line.getPoints()[0], y: line.getPoints()[1]};
    endPos = {
      x: lineConnectors.end.getAbsolutePosition().x - lineConnectors.start.getAbsolutePosition().x,
      y: lineConnectors.end.getAbsolutePosition().y - lineConnectors.start.getAbsolutePosition().y,
    };
    changeConnectorEndpoints(stage, line, startPos, endPos);
    var label = line.label();
    if (label !== null && typeof(label) !== 'undefined') {
      label.x(lineConnectors.start.getAbsolutePosition().x);
      label.y(lineConnectors.start.getAbsolutePosition().y + 5);
      label.width(endPos.x - startPos.x);
      var slope = (endPos.y - startPos.y) / (endPos.x - startPos.x);
      label.rotation(Math.atan(slope));
      line.label(label);
    }
  }
}

function _replaceTemporalElement(isEventA, containerParent, container, element, stage) {
  // Connect element connector to line
  var connector = findParentElementByName(element, (isEventA ? 'rightConnector' : 'leftConnector'));
  if (connector === null) {
    return;
  }

  // Clean up the elements that make up the placeholder
  containerParent.find(isEventA ? '.eventALabel' : '.eventBLabel')[0].destroy();
  containerParent.find(isEventA ? '.eventAText' : '.eventBText')[0].destroy();
  var connectorCollection = containerParent.find((isEventA ? '.leftConnector' : '.rightConnector'));
  var connectorIndex = isEventA ? 0 : (connectorCollection.length === 1 ? 0 : 1);
  connectorCollection[connectorIndex].destroy();
  var oldConnector = containerParent.find((isEventA ? '.rightConnector' : '.leftConnector'))[connectorIndex];
  var line = oldConnector.connections()[0];
  oldConnector.connections([]);
  oldConnector.destroy();
  container.destroy();

  // Update our tracking collections for how things are connected
  var lineConnectors = line.connectors();
  if (isEventA) {
    lineConnectors.start = connector;
  }
  else {
    lineConnectors.end = connector;
  }
  line.connectors(lineConnectors);

  var connections = connector.connections();
  connections.push(line);
  connector.connections(connections);
  updateConnectedLines(connector, stage);
}

// Given a droppable container, handle adding the element to that container
function addElementToContainer(stage, container, element) {
  var group = (container.nodeType === 'Group' ? container : container.parent);
  if (group) {
    var elementDefinition = group.element();
    var phemaObject = group.phemaObject();
    if (elementDefinition.type === 'TemporalOperator') {
      // Replace container with element
      var containerParent = container.getParent();
      if (container === containerParent.find('.eventA')[0]) {
        _replaceTemporalElement(true, containerParent, container, element, stage);
      }
      else if (container === container.getParent().find('.eventB')[0]) {
        _replaceTemporalElement(false, containerParent, container, element, stage);
      }
    }
    else if (elementDefinition.type === 'DataElement' || elementDefinition.type === 'Category') {
      phemaObject.valueSet(element);
      element.container = group;
      stage.draw();
    }
    else if (elementDefinition.type === 'LogicalOperator') {
      // Add the item (if it's not already in the array)
      var containedElements = phemaObject.containedElements();
      if (containedElements.indexOf(element) === -1) {
        containedElements.push(element);
        phemaObject.containedElements(containedElements);
        element.container = group;
      }

      phemaObject.layoutElementsInContainer(group);
      stage.draw();
    }
  }
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
  var element = dragElement.element();
  for (index = 0; index < dropElement.droppableElementTypes.length; index++) {
    if (dropElement.droppableElementTypes[index] === element.type) {
      return true;
    }
  }

  return false;
}


function removeElementFromContainer(stage, element) {
  if (element && element.container) {
    var group = (element.container.nodeType === 'Group' ? element.container : element.container.parent);
    var phemaObject = group.phemaObject();
    var containedElements = phemaObject.containedElements();
    var foundIndex = containedElements.indexOf(element);
    if (foundIndex < 0) {
      console.error('Unable to find element to remove from container');
      return;
    }
    containedElements.splice(foundIndex, 1);
    group.phemaObject().containedElements(containedElements);
    element.container = null;
    if (phemaObject.layoutElementsInContainer) {
      phemaObject.layoutElementsInContainer(group);
    }
    stage.mainLayer.draw();
  }
}

function selectObject(stage, selectObj, scope) {
  if (stage.connector && stage.connector.status === 'drawing') {
    return;
  }
  selectObj.selected = true;
  updateStrokeWidth(selectObj, false);
  stage.draw();

  if (scope) {
    // Because of the order in which events are handled, we need to broadcast an event that
    // we selected an item.  This is needed to update the context menu appropriately.
    scope.$root.$broadcast('sophe-element-selected', selectObj);
  }
}

function _clearSelection(item) {
  var counter = 0;
  var children = item.getChildren();
  for (counter = 0; counter < children.length; counter++) {
    if (children[counter].selected) {
      children[counter].selected = false;
      updateStrokeWidth(children[counter], true);
      _clearSelection(children[counter]);
    }
  }
}

function clearSelections(stage) {
  var layer = stage.mainLayer;
  _clearSelection(layer);
  stage.draw();
}

// Provide the "outline" effect for objects when you move the mouse
// over them.
function addOutlineStyles(kineticObj, originalWidth) {
  var normalWidth = (originalWidth || 1);
  kineticObj.on('mouseover', function (e) {
    if (!e.target.selected) {
      e.target.setStrokeWidth(normalWidth + 2);
      e.target.getParent().draw();
    }
  });
  kineticObj.on('mouseout', function (e) {
    if (!e.target.selected) {
      e.target.setStrokeWidth(normalWidth);
      e.target.getParent().draw();
    }
  });
}

// Responding to a mouse move event, update the current connector line that is being drawn
// to end at the cursor.
function updateActiveLineLocation(stage, evt) {
  if (stage.connector.status === 'drawing') {
    var startPos = {x: stage.connector.line.getX(), y: stage.connector.line.getY()};
    var endPos = {x: evt.evt.layerX, y: evt.evt.layerY};
    changeConnectorEndpoints(stage, stage.connector.line, startPos, endPos);
    stage.drawScene();
  }
}

// Start a connector line, anchored at a connector object
function startConnector(stage, connectorObj) {
  var connectorParent = connectorObj.getParent();
  var line = new Kinetic.PhemaConnection({
    x: connectorParent.getX() + connectorObj.getX(),
    y: connectorParent.getY() + connectorObj.getY(),
    points: [0, 0],
    stroke: 'black', strokeWidth: 2
  });
  var lineConnectors = {};
  lineConnectors.start = connectorObj;
  line.originalStrokeWidth(2);
  addOutlineStyles(line, 2);
  line.connectors(lineConnectors);

  stage.mainLayer.add(line);
  line.setZIndex(999);  // Should be on top
  stage.connector.status = 'drawing';
  stage.connector.line = line;
  line.parent.draw();
  stage.connector.anchor = connectorObj;
  connectorObj.getParent().draggable(false);
}

// For a line in progress, end the line at the given connector.  If no connector is present,
// or the connector isn't valid, remove the in progress line.
function endConnector(stage, connectorObj, scope, suppressCreateEvent) {
  var line = null;
  if (stage.connector.status === 'drawing') {
    // If we are dropping where we started, or there is no end connection point, the line
    // is invalid and we will just clear it
    if (stage.connector.anchor === connectorObj || ('undefined' === typeof connectorObj)) {
      stage.connector.line.destroy();
    }
    // Otherwise we have a valid line.  Update the internal collections tracking how objects
    // are related.
    else {
      line = stage.connector.line;
      var lineConnectors = line.connectors();
      lineConnectors.end = connectorObj;
      var connections = connectorObj.connections();
      connections.push(line);
      connectorObj.connections(connections);

      connections = lineConnectors.start.connections();
      connections.push(line);
      lineConnectors.start.connections(connections);
      line.connectors(lineConnectors);

      var labelTextOptions = {
        x: line.x(), y: line.y(),
        width: 100,
        fontFamily: 'Calibri', fontSize: 12, fill: 'black',
        text: '',
        align: 'center'
      };
      var labelObj = new Kinetic.Text(labelTextOptions);
      stage.mainLayer.add(labelObj);
      line.label(labelObj);
      line.element({name: labelTextOptions.text, uri: '', type: 'TemporalOperator'});

      var mouseUpHandler = function() {
        clearSelections(stage);
        selectObject(stage, line, scope);
      };
      line.on('mouseup', mouseUpHandler);
      labelObj.on('click', mouseUpHandler);
    }
  }

  if ('undefined' !== typeof stage.connector.anchor) {
    stage.connector.anchor.getParent().draggable(true);
  }

  stage.connector = {};
  stage.drawScene();

  if (line && !suppressCreateEvent) {
    selectObject(stage, line, scope);
    scope.$root.$broadcast('sophe-empty-temporal-operator-created', line);
  }

  return line;
}

function checkCollide(pointX, pointY, objectx, objecty, objectw, objecth) { // pointX, pointY belong to one rectangle, while the object variables belong to another rectangle
  var oTop = objecty;
  var oLeft = objectx;
  var oRight = objectx+objectw;
  var oBottom = objecty+objecth;

  if(pointX > oLeft && pointX < oRight){
    if(pointY > oTop && pointY < oBottom ){
      return true;
    }
  }
  return false;
}

function getIntersectingShape(layer, pos) {
  var groups = layer.getChildren();
  var shapes = null;
  var intersectingGroup = null;
  for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    if (checkCollide(pos.x, pos.y, groups[groupIndex].getX(), groups[groupIndex].getY(), groups[groupIndex].getWidth(), groups[groupIndex].getHeight())) {
      intersectingGroup = groups[groupIndex];

      // Once we identify an intersected group, we need to look for the underlying droppable Rect that should
      // be considered the actual drop target.  We always use a Rect because our visual indicator of
      // a drop target is to modify the Rect itself.
      shapes = intersectingGroup.getChildren();
      for (var shapeIndex = 0; shapeIndex < shapes.length; shapeIndex++) {
        if (shapes[shapeIndex].droppable) {
          // Shapes within the group are oriented at (0, 0).  Offset the X and Y coordinates with that of the group
          if (checkCollide(pos.x, pos.y, shapes[shapeIndex].getX() + intersectingGroup.getX(), shapes[shapeIndex].getY() + intersectingGroup.getY(), 
              shapes[shapeIndex].getWidth(), shapes[shapeIndex].getHeight())) {
            return shapes[shapeIndex];
          }
        }
      }

    }
  }

  return null;
}