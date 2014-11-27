/* globals Kinetic */
/* exported startConnector, endConnector, updateActiveLineLocation, getIntersectingShape, addElementToContainer */

'use strict';

var BORDER = 10;

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

function layoutElementsInContainer(group) {
  var currentX = BORDER;
  var header = group.getChildren(function(node) { return node.getClassName() === 'Text'; })[0];
  var currentY = header.getHeight() + BORDER;
  var maxHeight = 0;
  var element = null;
  for (var index = 0; index < group.containedElements.length; index ++) {
    element = group.containedElements[index];
    element.moveTo(group);
    element.setX(currentX);
    element.setY(currentY);
    currentX = currentX + element.getWidth() + BORDER;
    maxHeight = Math.max(currentY, currentY + element.getHeight() + BORDER);
  }

  var rect = group.getChildren(function(node) { return node.getClassName() === 'Rect'; })[0];
  rect.setWidth(currentX);
  rect.setHeight(maxHeight);
  header.setWidth(rect.getWidth());

  group.setWidth(rect.getWidth());
  group.setHeight(rect.getHeight());
}

// Given a droppable container, handle adding the element to that container
function addElementToContainer(stage, container, element) {
  var group = (container.nodeType === 'Group' ? container : container.parent);
  if (group) {
    if (group.element.type === 'TemporalOperator') {
      // Replace container with element
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
    group.containedElements = group.containedElements.splice(group.containedElements.indexOf(element), 1);
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
  var line = new Kinetic.Line({
    x: stage.getPointerPosition().x,
    y: stage.getPointerPosition().y,
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