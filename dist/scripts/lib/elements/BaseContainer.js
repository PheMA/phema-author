'use strict';

var BUFFER_FOR_CONNECTED_ITEMS = 50;

var BaseContainer = function() {};
BaseContainer.prototype = new BaseElement;

function _layoutElements(group, collection, vertical, dimensions) {
  var element = null;
  for (var index = 0; index < collection.length; index ++) {
    element = collection[index];
    element.moveTo(group);

    if (element.className !== 'PhemaConnection' && element.className !== 'Text') {
      element.setX(dimensions.currentX);
      element.setY(dimensions.currentY);
      if (vertical) {
        dimensions.currentY = dimensions.currentY + element.getHeight() + BORDER;
        dimensions.maxWidth = Math.max(dimensions.maxWidth, dimensions.currentX + element.getWidth() + BORDER);
      }
      else {
        dimensions.currentX = dimensions.currentX + element.getWidth() + BORDER;
        if (element.phemaObject && element.phemaObject().hasRightConnectedElements()) {
          dimensions.currentX = dimensions.currentX + BUFFER_FOR_CONNECTED_ITEMS;
        }
        dimensions.maxHeight = Math.max(dimensions.maxHeight, dimensions.currentY + element.getHeight() + BORDER);
      }
    }
  }

  return dimensions;
}

// In a container, first we lay out all data elements horizontally.  If there are any containers,
// then we lay them out vertically.
BaseContainer.prototype.layoutElementsInContainer = function(vertical) {
  vertical = false;
  var group = this._container;
  var header = group.getChildren(function(node) { return node.getClassName() === 'Text'; })[0];
  var rect = group.getChildren(function(node) { return node.getClassName() === 'Rect'; })[0];

  if (!header || !rect) {
    return;
  }

  if (this._containedElements.length === 0) {
    updateSizeOfMainRect(rect, group, 200, 200);
    header.setWidth(rect.getWidth());
    this.reconcileMinimumSize(group);
    return;
  }

  var element = null;
  var horizontalItems = new Array;
  var verticalItems = new Array;
  var details = null;
  for (var index = 0; index < this._containedElements.length; index ++) {
    element = this._containedElements[index];
    element.moveTo(group);

    if (element.className === 'PhemaGroup') {
      details = element.element();
      if (details.type === Constants.ElementTypes.DATA_ELEMENT || details.type === Constants.ElementTypes.CATEGORY) {
        horizontalItems.push(element);
      }
      else {
        verticalItems.push(element);
      }
    }
  }

  var dimensions = {
    currentX: BORDER,
    currentY: (header ? header.getHeight() + BORDER : BORDER),
    maxHeight: 0,
    maxWidth: 0,
  };
  _layoutElements(group, horizontalItems, false, dimensions);
  dimensions.maxWidth = dimensions.currentX;
  dimensions.maxHeight = Math.max(dimensions.currentY, dimensions.maxHeight);

  dimensions.currentX = BORDER;
  dimensions.currentY = dimensions.maxHeight;
  _layoutElements(group, verticalItems, true, dimensions);

  dimensions.maxWidth = Math.max(dimensions.maxWidth, dimensions.currentX);
  dimensions.maxHeight = Math.max(dimensions.maxHeight, dimensions.currentY);


  // After all of the elements have been moved, loop through again to refresh connected lines
  for (var index = 0; index < this._containedElements.length; index ++) {
    element = this._containedElements[index];
    if (element.className !== 'PhemaConnection' && element.className !== 'Text') {
      updateConnectedLines(findParentElementByName(element, 'rightConnector'), null);
      updateConnectedLines(findParentElementByName(element, 'leftConnector'), null);
    }
  }

  var newWidth = 0;
  var newHeight = 0;
  newWidth = dimensions.maxWidth;
  newHeight = dimensions.maxHeight;

  updateSizeOfMainRect(rect, group, newWidth, newHeight);
  if (header && rect) {
    header.setWidth(rect.getWidth());
  }
  this.reconcileMinimumSize(group);
};