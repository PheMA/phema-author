/* globals Kinetic, Constants */
/* exported startConnector, endConnector, updateActiveLineLocation, getIntersectingShape,
  addElementToContainer, removeElementFromContainer, updateConnectedLines, changeConnectorEndpoints,
  allowsDrop, findObjectInPhemaGroupType, BORDER, updateSizeOfMainRect, resizeStageForEvent, MINIMUM_CANVAS_SIZE,
  createSelectionRectangle, updateSelectionRectangle, removeSelectionRectangle, highlightItemsInSelectionRectangle */

'use strict';

var BORDER = 20;
var MINIMUM_CANVAS_SIZE = { width: 800, height: 600 };
var SELECTION_RECTANGLE_NAME = 'PhemaSelectionRectangle';

// Find the first descendant in 'kineticObj' with the name of 'name'.
// If 'shallow' is set to true, it will only search immediate children
// of 'kineticObj'.
function findFirst(kineticObj, name, shallow) {
  if (shallow) {
    var index = 0;
    var children = kineticObj.getChildren();
    for (index = 0; index < children.length; index++) {
      if (children[index].name() === name) {
        return children[index];
      }
    }

    return null;
  }
  else {
    return kineticObj.find('.' + name)[0];
  }
}

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
    var mainRect = findFirst(kineticObj, 'mainRect', true);
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
  if (!rect || !group) {
    return;
  }

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
  if (elements) {
    var length = elements.length;
    for (var index = 0; index < length; index++) {
      if (elements[index].getParent() === parent) {
        return elements[index];
      }
    }
  }
  return null;
}

// Update a connector line so that it is drawn between a start position and an
// end position.
function changeConnectorEndpoints(line, startPos, endPos) {
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

// Given connections for a line, calculate and set the position of the label.
function _setLabelLocationGivenConnections(lineConnectors, line) {
  var label = line.label();
  if (label !== null && typeof(label) !== 'undefined') {
    var linePos = line.getPosition();
    var linePoints = line.getPoints();

    label.x(linePos.x);
    label.y(linePos.y + 5);
    label.width(linePoints[2]);

    var slope = (linePoints[3] - linePoints[1]) / (linePoints[2] - linePoints[0]);
    label.setRotationDeg(Math.atan(slope) * (180 / Math.PI));   // atan gives us radians, so we convert to degrees
    line.label(label);
    label.moveToTop();
  }
}

function updateConnectedLines(connector) {
  if (connector === null || connector === undefined) {
    return;
  }

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
    changeConnectorEndpoints(line, startPos, endPos);
    line.moveToTop();
    _setLabelLocationGivenConnections(lineConnectors, line);
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

function _addElementToOperator(element, operatorObject) {
  var containedElements = operatorObject.containedElements();
  if (containedElements.indexOf(element) === -1) {
    containedElements.push(element);
    operatorObject.containedElements(containedElements);
    element.container = operatorObject._container;
  }
}

// Given a droppable container, handle adding the element to that container
function addElementToContainer(stage, container, element) {
  var group = (container.nodeType === 'Group' ? container : container.parent);
  if (group) {
    var groupDefinition = group.element();
    var phemaObject = group.phemaObject();
    if (groupDefinition.type === 'TemporalOperator') {
      // Replace container with element
      var containerParent = container.getParent();
      if (container === containerParent.find('.eventA')[0]) {
        _replaceTemporalElement(true, containerParent, container, element, stage);
      }
      else if (container === container.getParent().find('.eventB')[0]) {
        _replaceTemporalElement(false, containerParent, container, element, stage);
      }
    }
    else if (groupDefinition.type === Constants.ElementTypes.DATA_ELEMENT || groupDefinition.type === Constants.ElementTypes.CATEGORY) {
      phemaObject.valueSet(element);
      element.container = group;
      stage.draw();
    }
    else if (groupDefinition.type === 'LogicalOperator' || groupDefinition.type === Constants.ElementTypes.SUBSET_OPERATOR || groupDefinition.type === Constants.ElementTypes.FUNCTION_OPERATOR) {
      // Add the item (if it's not already in the array)
      _addElementToOperator(element, phemaObject);

      // If we have connected (via a temporal operator) to other elements, we need to bring those
      // into our group too.
      var counter = 0;
      var connectedElements = element.phemaObject().getConnectedElements(true);
      for (counter = 0; counter < connectedElements.length; counter++) {
        _addElementToOperator(connectedElements[counter], phemaObject);
      }

      if (phemaObject.layoutElementsInContainer) {
        phemaObject.layoutElementsInContainer();
      }
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

  // Not all elements care about capacity.  For those that do, we will verify they can accept
  // new elements.
  if (dropElement.parent && dropElement.parent.phemaObject() && dropElement.parent.phemaObject().atCapacity()) {
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

// Utility function to perform the actual removal of an element from a group, ensuring it exists
// and clearing out all appropriate object references.
function _removeElementFromContainer(group, containedElements, element) {
  var foundIndex = containedElements.indexOf(element);
  if (foundIndex < 0) {
    console.error('Unable to find element to remove from container');
    return;
  }
  containedElements.splice(foundIndex, 1);
  group.phemaObject().containedElements(containedElements);
  element.container = null;
}

function _updateElementConnections(element) {
  if (element && element.className !== 'PhemaConnection' && element.className !== 'Text') {
    updateConnectedLines(findParentElementByName(element, 'rightConnector'), null);
    updateConnectedLines(findParentElementByName(element, 'leftConnector'), null);
  }
}

// Remove an element (passed as a parameter) from whichever container it is currently a member
// of.  If there are associated elements that also need to be removed (such as with temporally
// related items), move those as well.
function removeElementFromContainer(stage, element) {
  if (element && element.container) {
    var group = (element.container.nodeType === 'Group' ? element.container : element.container.parent);
    var phemaObject = group.phemaObject();
    var containedElements = phemaObject.containedElements();
    _removeElementFromContainer(group, containedElements, element);

    // If we have connected (via a temporal operator) to other elements, we need to bring those
    // into our group too.
    var counter = 0;
    var connectedElements = element.phemaObject().getConnectedElements(true);
    for (counter = 0; counter < connectedElements.length; counter++) {
      connectedElements[counter].moveTo(element.parent);
      _removeElementFromContainer(group, containedElements, connectedElements[counter]);
    }

    if (phemaObject.layoutElementsInContainer) {
      phemaObject.layoutElementsInContainer();
    }

    // Because the layout algorithm doesn't update connected lines for things that have been removed,
    // we will add a separate processing loop here to update our lines accordingly.
    for (counter = 0; counter < connectedElements.length; counter ++) {
      _updateElementConnections(connectedElements[counter]);
    }
    _updateElementConnections(element);

    if (stage) {
      stage.mainLayer.draw();
    }
  }
}

function isDrawingLine(stage) {
  return (stage && stage.connector && stage.connector.status === 'drawing');
}

function selectObject(stage, selectObj, scope) {
  if (isDrawingLine(stage)) {
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
  var clearChildren = false;
  for (counter = 0; counter < children.length; counter++) {
    clearChildren = (children[counter].selected || children[counter].nodeType === 'Group');
    if (children[counter].selected) {
      children[counter].selected = false;
      updateStrokeWidth(children[counter], true);
    }

    if (clearChildren) {
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
  if (isDrawingLine(stage)) {
    var startPos = {x: stage.connector.line.getX(), y: stage.connector.line.getY()};
    var endPos = {x: evt.evt.layerX, y: evt.evt.layerY};
    changeConnectorEndpoints(stage.connector.line, startPos, endPos);
    stage.drawScene();
  }
}

// Start a connector line, anchored at a connector object
function startConnector(stage, connectorObj) {
  clearSelections(stage);
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
  if (isDrawingLine(stage)) {
    // If we are dropping where we started, or there is no end connection point, or we are drawing
    // an invalid connection (from a classification label to something else) the line is invalid 
    // and we will just clear it
    if (stage.connector.anchor === connectorObj || ('undefined' === typeof connectorObj) || stage.connector.anchor.parent.element().type === Constants.ElementTypes.CLASSIFICATION) {
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

      // If we are connected to a classification label, the line type should just be a General type
      // that has no properties associated with it.
      var lineType = 'TemporalOperator';
      if (connectorObj.parent.element().type === Constants.ElementTypes.CLASSIFICATION) {
        lineType = 'General';
        suppressCreateEvent = true;
      }
      line.element({name: labelTextOptions.text, uri: '', type: lineType});

      _setLabelLocationGivenConnections(lineConnectors, line);

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
  var oTop = Math.min(objecty, objecty+objecth);
  var oLeft = Math.min(objectx, objectx+objectw);
  var oRight = Math.max(objectx, objectx+objectw);
  var oBottom = Math.max(objecty, objecty+objecth);

  if(pointX > oLeft && pointX < oRight){
    if(pointY > oTop && pointY < oBottom ){
      return true;
    }
  }
  return false;
}

function containedInSelection(selectionRectangle, shape) {
  // Check if any of the 4 corners are contained in the selection.
  var selX = selectionRectangle.getX();
  var selY = selectionRectangle.getY();
  var selWidth = selectionRectangle.getWidth();
  var selHeight = selectionRectangle.getHeight();
  if (checkCollide(shape.getX(), shape.getY(), selX, selY, selWidth, selHeight) ||
    checkCollide(shape.getX() + shape.getWidth(), shape.getY(), selX, selY, selWidth, selHeight) ||
    checkCollide(shape.getX(), shape.getY() + shape.getHeight(), selX, selY, selWidth, selHeight) ||
    checkCollide(shape.getX() + shape.getWidth(), shape.getY() + shape.getHeight(), selX, selY, selWidth, selHeight)) {
    return true;
  }

  return false;
}

function getContainedShapes(layer, shape, stopOnFirstFound) {
  var groups = layer.getChildren();
  var intersectingShapes = [];
  stopOnFirstFound = (typeof stopOnFirstFound !== 'undefined' ? stopOnFirstFound : false);
  for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    if (containedInSelection(shape, groups[groupIndex])) {
      intersectingShapes.push(groups[groupIndex]);
      if (stopOnFirstFound) {
        return intersectingShapes;
      }
    }
  }

  return intersectingShapes;
}

/*
  _getIntersectingShape

  The internal workhorse for intersection detection.  It is called recursively, depending on how the shapes on
  the canvas are nested.  For example, a logical container could have another logical container, which has a
  data element inside it.  When we get a particular object from the canvas, we then need to look at its nested
  shapes (from getChildren) to truly assess what is the appropriate intersecting shape.

  Since there could be multiple intersecting shapes when there is nesting/overlap, we make a best effort to
  prioritize the result.  For nested shapes, we first check all nested PhemaGroup elements.  This should prioritize
  for the most specific nested shape.  Otherwise, it will prioritize the first shape found (a somewhat arbitrary order).

  groups - an array of UI elements (typically PhemaGroup) that are candidate drop targets.
  pos - the coordinates to use as the intersection point (an object, e.g. {x: 1, y: 1})
  parentOffset - when calling this function for a list of groups from the main canvas, this should be {x:0, y:0}.
      As execution continues, it tracks the offset of each parent shape.  This is because the shapes X,Y coordinates
      are just tracked with respect to their parent, and not the entire canvas.
  applyDropFilter - optional.  Set to true if you want to only return an element that can be dropped on.
  dragItem - optional.  Used when applyDropFilter is true, this is the item that is being dragged (and should be dropped) on a target.
*/
function _getIntersectingShape(groups, pos, parentOffset, applyDropFilter, dragItem) {
  var shapes = null;
  var intersectingGroup = null;
  for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    if (checkCollide(pos.x, pos.y, groups[groupIndex].getX() + parentOffset.x, groups[groupIndex].getY() + parentOffset.y, groups[groupIndex].getWidth(), groups[groupIndex].getHeight())) {
      var shape = null;
      intersectingGroup = groups[groupIndex];
      shapes = intersectingGroup.getChildren();

      // For our preferred order of selecting shapes, we first are going to look at nested objects and find the
      // innermost droppable target.
      var shapeIndex = 0;
      for (shapeIndex = 0; shapeIndex < shapes.length; shapeIndex++) {
        shape = shapes[shapeIndex];
        if (shape.className === 'PhemaGroup') {
          var nestedOffset = {x: parentOffset.x, y: parentOffset.y};
          nestedOffset.x += intersectingGroup.getX();
          nestedOffset.y += intersectingGroup.getY();
          var nestedResult = _getIntersectingShape([shape], pos, nestedOffset, applyDropFilter, dragItem);
          if (nestedResult) {
            return nestedResult;
          }
        }
      }

      // Once we identify an intersected group, we need to look for the underlying droppable Rect that should
      // be considered the actual drop target.  We always use a Rect because our visual indicator of
      // a drop target is to modify the Rect itself.
      for (shapeIndex = 0; shapeIndex < shapes.length; shapeIndex++) {
        shape = shapes[shapeIndex];
        if (shape.droppable) {
          // Shapes within the group are oriented at (0, 0).  Offset the X and Y coordinates with that of the group
          if (checkCollide(pos.x, pos.y,
              shape.getX() + intersectingGroup.getX() + parentOffset.x,
              shape.getY() + intersectingGroup.getY() + parentOffset.y, 
              shape.getWidth(), shape.getHeight())) {

            if (applyDropFilter && !allowsDrop(dragItem, shape)) {
              continue;
            }
          
            return shape;
          }
        }
      }

    }
  }

  return null;
}


/*
  getIntersectingShape

  Returns the first element that has an intersecting, droppable rectangle on it.  This optionally
  allows filtering to only return the first element that supports dropping a certain drag item.

  layer - the layer in which we will search for droppable elements
  pos - the coordinates to use as the intersection point (an object, e.g. {x: 1, y: 1})
  applyDropFilter - optional.  Set to true if you want to only return an element that can be dropped on.
  dragItem - optional.  Used when applyDropFilter is true, this is the item that is being dragged (and should be dropped) on a target.
*/
function getIntersectingShape(layer, pos, applyDropFilter, dragItem) {
  var groups = layer.getChildren();
  var parentOffset = {x:0, y:0};
  return _getIntersectingShape(groups, pos, parentOffset, applyDropFilter, dragItem);
}

function _setDimension(farthestChild, mainLayer, minimumSize) {
  var result = { size: 0, isChanged: false };
  if (farthestChild !== mainLayer) {
    if (farthestChild <= minimumSize) {
      result.size = minimumSize;
    }
    else {
      result.size = farthestChild;
    }
    result.isChanged = true;
  }
  else {
    result.size = mainLayer;
  }

  return result;
}

// updatedSize - new dimensions, set after a resize event.  This is expected to be null
//    when a drag and drop event is processed.
// movedElement - the element that was moved in a drag and drop operation.  This is
//    expected to be null when a resize event is processed.
function resizeStageForEvent(stage, updatedSize, movedElement) {
  var isChanged = false;
  var mainLayer = stage.mainLayer;
  var newSize = { width: 0, height: 0 };
  var farthestChild = { width: 0, height: 0 };

  // Determine absolute minimum allowed size.  It should never be less than the larger of:
  // - minimum height & weight set on construction
  // - current container DIV width and height
  var viewport = stage.content;
  var minimumSize = {
    width: Math.max(MINIMUM_CANVAS_SIZE.width, viewport.width),
    height: Math.max(MINIMUM_CANVAS_SIZE.height, viewport.height)
  };

  // It should expand as far as the visible area (when the window resizes), but not be smaller
  if (updatedSize !== null && updatedSize !== undefined) {
    // The new size will be set in response to a window resize
    farthestChild.width = updatedSize.width;
    farthestChild.height = updatedSize.height;
  }

  // Find the farthest control along X and Y axes.  Make sure the stage fits that.
  // If not, expand the stage to that object, plus a little more (for future growth).
  // If we moved an element, we need to look at all of the elements again to figure out
  // what is now the farthest along.  The element we moved may have been moved in, and we
  // need to shrink the canvas back down (not up).
  if (movedElement !== null && movedElement !== undefined) {
    var child = null;
    var children = mainLayer.getChildren();
    var childExtent = {};
    for (var index = 0; index < children.length; index++) {
      child = children[index];
      childExtent.x = child.getX() + child.getWidth();
      childExtent.y = child.getY() + child.getHeight();
      if (childExtent.x > farthestChild.width) {
        farthestChild.width = childExtent.x + 25;
      }

      if (childExtent.y > farthestChild.height) {
        farthestChild.height = childExtent.y + 25;
      }
    }
  }

  // First, just figure out if there is a difference in the height or width.  Then we'll manage
  // if we actually need to change the width or height (depending on limits).
  var result = _setDimension(farthestChild.width, mainLayer.getWidth(), minimumSize.width);
  newSize.width = result.size;
  isChanged = isChanged || result.isChanged;

  result = _setDimension(farthestChild.height, mainLayer.getHeight(), minimumSize.height);
  newSize.height = result.size;
  isChanged = isChanged || result.isChanged;

  if (isChanged) {
    mainLayer.setWidth(newSize.width);
    mainLayer.setHeight(newSize.height);
    stage.backgroundLayer.setWidth(newSize.width);
    stage.backgroundLayer.setHeight(newSize.height);
    stage.backgroundLayer.children[0].setWidth(newSize.width);
    stage.backgroundLayer.children[0].setHeight(newSize.height);
    stage.backgroundLayer.draw();
    stage.setWidth(newSize.width);
    stage.setHeight(newSize.height);

    stage.drawScene();
  }
}

// Establish the visible selection rectangle in the specified layer.
// This will begin drawing at the stage's current cursor position.
function createSelectionRectangle(stage, layer) {
  var pointerPosition = stage.getPointerPosition();
  var x = Math.floor(pointerPosition.x);
  var y = Math.floor(pointerPosition.y);
  var selectionRectangle = new Kinetic.Rect({
       x: x,
       y: y,
       width: 0,
       height: 0,
       stroke: 'gray',
       strokeWidth: 2,
       name: SELECTION_RECTANGLE_NAME
   });
  selectionRectangle.dash([5, 5]);
  selectionRectangle.dashEnabled(true);
  selectionRectangle.setListening(false);
  layer.add(selectionRectangle);
}

// Update the dimensions of the selection rectangle, if it exists in the
// specified layer.  The cursor is assumed to now be at the stage's
// current position.
function updateSelectionRectangle(stage, layer) {
  var pointerPosition = stage.getPointerPosition();
  var x = Math.floor(pointerPosition.x);
  var y = Math.floor(pointerPosition.y);
  var selectionRectangle = findFirst(layer, SELECTION_RECTANGLE_NAME, true);
  if (selectionRectangle) {
    selectionRectangle.setWidth(x - selectionRectangle.getX());
    selectionRectangle.setHeight(y - selectionRectangle.getY());
    layer.drawScene();
  }
}

// Clean up and remove the selection rectangle from the specified layer.
function removeSelectionRectangle(layer) {
  var selectionRectangle = findFirst(layer, SELECTION_RECTANGLE_NAME, true);
  if (selectionRectangle) {
    selectionRectangle.destroy();
    layer.drawScene();
  }
}

// Identify all objects in the selection rectangle and mark those as selected.
function highlightItemsInSelectionRectangle(stage, layer) {
  var selectionRectangle = findFirst(layer, SELECTION_RECTANGLE_NAME, true);
  if (!selectionRectangle) {
    return;
  }

  clearSelections(stage);

  var containedShapes = getContainedShapes(layer, selectionRectangle);
  for (var index = 0; index < containedShapes.length; index++) {
    selectObject(stage, containedShapes[index]);
  }
}