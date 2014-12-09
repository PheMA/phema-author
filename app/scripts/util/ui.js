/* globals Kinetic */
/* exported startConnector, endConnector, updateActiveLineLocation, getIntersectingShape,
  addElementToContainer, removeElementFromContainer, updateConnectedLines, changeConnectorEndpoints */

'use strict';

var BORDER = 20;

function updateStrokeWidth(kineticObj, normal) {
  var strokeWidth = kineticObj.originalStrokeWidth || 1;
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

// For a container (represented by group), lay out all contained elements within the
// main rectangle.
function layoutElementsInContainer(group) {
  var header = group.getChildren(function(node) { return node.getClassName() === 'Text'; })[0];
  var rect = group.getChildren(function(node) { return node.getClassName() === 'Rect'; })[0];

  if (group.containedElements.length === 0) {
    updateSizeOfMainRect(rect, group, 200, 200);
    header.setWidth(rect.getWidth());
    return;
  }

  var currentX = BORDER;
  var currentY = header.getHeight() + BORDER;
  var maxHeight = 0;
  var element = null;
  for (var index = 0; index < group.containedElements.length; index ++) {
    element = group.containedElements[index];
    element.moveTo(group);
    element.setX(currentX);
    element.setY(currentY);
    currentX = currentX + element.getWidth() + BORDER;
    maxHeight = Math.max(maxHeight, currentY + element.getHeight() + BORDER);
  }

  updateSizeOfMainRect(rect, group, currentX, maxHeight);
  header.setWidth(rect.getWidth());
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
  var line = oldConnector.connections[0];
  oldConnector.connections = [];
  oldConnector.destroy();
  container.destroy();

  // Update our tracking collections for how things are connected
  if (isEventA) {
    line.connectors.start = connector;
  }
  else {
    line.connectors.end = connector;
  }
  connector.connections.push(line);
  updateConnectedLines(connector, stage);
}

// Given a droppable container, handle adding the element to that container
function addElementToContainer(stage, container, element) {
  var group = (container.nodeType === 'Group' ? container : container.parent);
  if (group) {
    if (group.element.type === 'TemporalOperator') {
      // Replace container with element
      var containerParent = container.getParent();
      if (container === containerParent.find('.eventA')[0]) {
        _replaceTemporalElement(true, containerParent, container, element, stage);
        // // Connect element right connector to line
        // var connector = findParentElementByName(element, 'rightConnector');
        // if (connector === null) {
        //   return;
        // }

        // // Move the element to be centered in the placeholder

        // // Clean up the elements that make up the placeholder
        // containerParent.find('.eventALabel')[0].destroy();
        // containerParent.find('.eventAText')[0].destroy();
        // containerParent.find('.leftConnector')[0].destroy();
        // var oldConnector = containerParent.find('.rightConnector')[0];
        // var line = oldConnector.connections[0];
        // oldConnector.connections = [];
        // oldConnector.destroy();
        // container.destroy();

        // line.connectors.start = connector;
        // connector.connections.push(line);
        // updateConnectedLines(connector, stage);
      }
      else if (container === container.getParent().find('.eventB')[0]) {
        _replaceTemporalElement(false, containerParent, container, element, stage);
        // // Connect element left connector to line
        // var connector = findParentElementByName(element, 'leftConnector');
        // if (connector === null) {
        //   return;
        // }

        // // Move the element to be centered in the placeholder

        // // Clean up the elements that make up the placeholder
        // containerParent.find('.eventBLabel')[0].destroy();
        // containerParent.find('.eventBText')[0].destroy();
        // containerParent.find('.rightConnector')[1].destroy();
        // var oldConnector = containerParent.find('.leftConnector')[1];
        // var line = oldConnector.connections[0];
        // oldConnector.connections = [];
        // oldConnector.destroy();
        // container.destroy();

        // line.connectors.end = connector;
        // connector.connections.push(line);
        // updateConnectedLines(connector, stage);
      }
    }
    else if (group.element.type === 'DataElement' || group.element.type === 'Category') {
    }
    else if (group.element.type === 'LogicalOperator') {
      // Add the item (if it's not already in the array)
      if (group.containedElements.indexOf(element) === -1) {
        group.containedElements.push(element);
        element.container = group;
      }
      layoutElementsInContainer(group);
      stage.draw();
    }
  }
}

function removeElementFromContainer(stage, element) {
  if (element && element.container) {
    var group = (element.container.nodeType === 'Group' ? element.container : element.container.parent);
    var foundIndex = group.containedElements.indexOf(element);
    if (foundIndex < 0) {
      console.error('Unable to find element to remove from container');
      return;
    }
    group.containedElements.splice(foundIndex, 1);
    element.container = null;
    layoutElementsInContainer(group);
    stage.mainLayer.draw();
  }
}

function selectObject(stage, selectObj) {
  if (stage.connector && stage.connector.status === 'drawing') {
    return;
  }
  selectObj.selected = true;
  updateStrokeWidth(selectObj, false);
  stage.draw();
}

function clearSelections(stage) {
  var layer = stage.find('#mainLayer')[0];
  var counter = 0;
  var children = layer.getChildren();
  for (counter = 0; counter < children.length; counter++) {
    children[counter].selected = false;
    updateStrokeWidth(children[counter], true);
  }
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
  var line = new Kinetic.Line({
    //x: stage.getPointerPosition().x,
    //y: stage.getPointerPosition().y,
    x: connectorParent.getX() + connectorObj.getX(),
    y: connectorParent.getY() + connectorObj.getY(),
    points: [0, 0],
    stroke: 'black', strokeWidth: 2
  });
  line.connectors = {};
  line.connectors.start = connectorObj;
  line.originalStrokeWidth = 2;
  addOutlineStyles(line, 2);

  stage.find('#mainLayer').add(line);
  line.setZIndex(999);  // Should be on top
  stage.connector.status = 'drawing';
  stage.connector.line = line;
  line.parent.draw();
  stage.connector.anchor = connectorObj;
  connectorObj.getParent().draggable(false);
}

// For a line in progress, end the line at the given connector.  If no connector is present,
// or the connector isn't valid, remove the in progress line.
function endConnector(stage, connectorObj) {
  if (stage.connector.status === 'drawing') {
    // If we are dropping where we started, or there is no end connection point, the line
    // is invalid and we will just clear it
    if (stage.connector.anchor === connectorObj || ('undefined' === typeof connectorObj)) {
      stage.connector.line.destroy();
    }
    // Otherwise we have a valid line.  Update the internal collections tracking how objects
    // are related.
    else {
      stage.connector.line.connectors.end = connectorObj;
      connectorObj.connections.push(stage.connector.line);
      stage.connector.line.connectors.start.connections.push(stage.connector.line);
      stage.connector.line.on('mouseup', function(e) {
        clearSelections(stage);
        selectObject(stage, e.target);
      });
    }
  }

  if ('undefined' !== typeof stage.connector.anchor) {
    stage.connector.anchor.getParent().draggable(true);
  }

  stage.connector = {};
  stage.drawScene();
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