'use strict';

/* globals updateSizeOfMainRect */

var LogicalOperator = function() {}
LogicalOperator.prototype = new BaseElement;

var LOGICAL_OPERATOR_SIZER_SIZE = 7;
var LOGICAL_OPERATOR_MIN_SIZE = 100;

LogicalOperator.prototype.resizeShapeToGroup = function(group, scope) {
  var mainRect = group.find('.mainRect')[0];
  mainRect.setWidth(group.getWidth());
  mainRect.setHeight(group.getHeight());
  var header = group.find('.header')[0];
  header.setWidth(mainRect.getWidth());
  updateSizeOfMainRect(mainRect, group, group.getWidth(), group.getHeight());
};

LogicalOperator.prototype.calculateMinimumSize = function(group) {
  var farthestX = LOGICAL_OPERATOR_MIN_SIZE;
  var farthestY = LOGICAL_OPERATOR_MIN_SIZE;
  for (var index = 0; index < this._containedElements.length; index++) {
    var element = this._containedElements[index];
    farthestX = Math.max(element.getX() + element.getWidth(), farthestX);
    farthestY = Math.max(element.getY() + element.getHeight(), farthestY);
  }

  this._minimumSize = { width: farthestX + BORDER, height: farthestY + BORDER };
}

LogicalOperator.prototype.reconcileMinimumSize = function(group) {
  this.calculateMinimumSize(group);
  var sizeBar = group.find('.sizer');
  sizeBar.setX(group.width() - LOGICAL_OPERATOR_SIZER_SIZE);
  sizeBar.setY(group.height() - LOGICAL_OPERATOR_SIZER_SIZE);
}

// For a container (represented by group), lay out all contained elements within the
// main rectangle.
LogicalOperator.prototype.layoutElementsInContainer = function() {
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
  var element = null;
  for (var index = 0; index < this._containedElements.length; index ++) {
    element = this._containedElements[index];
    element.moveTo(group);
    element.setX(currentX);
    element.setY(currentY);
    currentX = currentX + element.getWidth() + BORDER;
    maxHeight = Math.max(maxHeight, currentY + element.getHeight() + BORDER);
  }

  updateSizeOfMainRect(rect, group, currentX, maxHeight);
  header.setWidth(rect.getWidth());
  this.reconcileMinimumSize(group);
};

// Connects the appropriate QDM logical operator shapes to event handlers.
// Used when constructing a new element, or when loading from a definition.
LogicalOperator.prototype.connectEvents = function(group, scope) {
  this.addStandardEventHandlers(group, scope);
  this.addCursorEventHandlers(group, scope);
  this.setDroppable(group.find('.mainRect')[0], ['Category', 'DataElement', 'LogicalOperator']);
  this.addConnectionHandler(group.find('.leftConnector')[0], scope);
  this.addConnectionHandler(group.find('.rightConnector')[0], scope);
  this.connectConnectorEvents(group);
  var sizer = group.find('.sizer')[0];
  this.addSizerEventHandlers(sizer, scope);
};

LogicalOperator.prototype.containedElements = function(elements) {
  if ('undefined' === typeof elements) {
    return this._containedElements;
  }
  else {
    this._containedElements = elements;
    this.calculateMinimumSize(this._container);
  }
};

LogicalOperator.prototype.create = function(config, scope) {
  var options = {
    x: 0, y: 0, width: 200, height: 200,
    fill: '#eeeeee', name: 'mainRect',
    stroke: 'gray', strokeWidth: 1
  };

  var group = new Kinetic.PhemaGroup({
    draggable: true,
    x: ((config && config.x) ? config.x : 50),
    y: ((config && config.y) ? config.y : 50),
    width: options.width, height: options.height });
  this._container = group;
  group.phemaObject(this);

  var mainRect = this.createRectangle(options, group);
  mainRect.dash([10, 5]);
  mainRect.dashEnabled(true);

  var headerOptions = {
    x: options.x, y: options.y,
    width: options.width, // Leave out height so it auto-sizes
    fontFamily: 'Calibri', fontSize: 14, fill: 'black',
    text: config.element.name, name: 'header',
    align: 'center', padding: 5
  };
  this.createText(headerOptions, group);

  this.addConnectors(scope, mainRect, group);

  var sizer = new Kinetic.PhemaSizeBar({
    stroke: 'gray', strokeWidth: 1, fill: 'gray',
    x: mainRect.width() - LOGICAL_OPERATOR_SIZER_SIZE, y: mainRect.height() - LOGICAL_OPERATOR_SIZER_SIZE,
    width: LOGICAL_OPERATOR_SIZER_SIZE, height: LOGICAL_OPERATOR_SIZER_SIZE, name: 'sizer'
  });
  group.add(sizer);

  this.connectEvents(group, scope);

  this.containedElements([]);
  var mainLayer = scope.canvasDetails.kineticStageObj.mainLayer;
  mainLayer.add(group);
  mainLayer.draw();
};

LogicalOperator.prototype.toObject = function() {
  var obj = {};

  obj.containedElements = [];
  for (var index = 0; index < this._containedElements.length; index++) {
    obj.containedElements.push({id: this._containedElements[index]._id});
  }
  obj.className = 'LogicalOperator';
  return obj;
};

LogicalOperator.prototype.load = function(group, scope) {
  var obj = group.phemaObject();
  this.containedElements(obj.containedElements);
  this.container(group);
  group.phemaObject(this);
  this.connectEvents(group, scope);
  this.associateReferences(group, scope);
  this.calculateMinimumSize(group);
};