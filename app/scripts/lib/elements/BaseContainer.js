'use strict';

var BUFFER_FOR_CONNECTED_ITEMS = 50;

var BaseContainer = function() {};
BaseContainer.prototype = new BaseElement;

// For a container (represented by group), lay out all contained elements within the
// main rectangle.  By default this will be horizontally, but if the vertical parameter
// is set to true, it will render vertically.
BaseContainer.prototype.layoutElementsInContainer = function(vertical) {
  vertical = false;
  var group = this._container;
  var header = group.getChildren(function(node) { return node.getClassName() === 'Text'; })[0];
  var rect = group.getChildren(function(node) { return node.getClassName() === 'Rect'; })[0];

  if (this._containedElements.length === 0) {
    updateSizeOfMainRect(rect, group, 200, 200);
    header.setWidth(rect.getWidth());
    this.reconcileMinimumSize(group);
    return;
  }

  var currentX = BORDER;
  var currentY = header.getHeight() + BORDER;
  var maxHeight = 0;
  var maxWidth = 0;
  var element = null;
  for (var index = 0; index < this._containedElements.length; index ++) {
    element = this._containedElements[index];
    element.moveTo(group);
    element.setX(currentX);
    element.setY(currentY);
    if (vertical) {
      currentY = currentY + element.getHeight() + BORDER;
      maxWidth = Math.max(maxWidth, currentX + element.getWidth() + BORDER);
    }
    else {
      currentX = currentX + element.getWidth() + BORDER;
      if (element.phemaObject().hasRightConnectedElements()) {
        currentX = currentX + BUFFER_FOR_CONNECTED_ITEMS;
      }
      maxHeight = Math.max(maxHeight, currentY + element.getHeight() + BORDER);
    }

    updateConnectedLines(findParentElementByName(element, 'rightConnector'), null);
    updateConnectedLines(findParentElementByName(element, 'leftConnector'), null);
  }

  var newWidth = 0;
  var newHeight = 0;
  if (vertical) {
    newWidth = maxWidth;
    newHeight = currentY;
  }
  else {
    newWidth = currentX;
    newHeight = maxHeight;
  }

  updateSizeOfMainRect(rect, group, newWidth, newHeight);
  header.setWidth(rect.getWidth());
  this.reconcileMinimumSize(group);
};