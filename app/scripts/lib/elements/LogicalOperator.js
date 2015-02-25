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
  // sizer.on('mouseover', function (e) {
  //   document.body.style.cursor = 'nwse-resize';
  //   e.cancelBubble = true;      // Needed for issue with KineticJS not looking at inner event
  //   e.evt.cancelBubble = true;
  // });
  // sizer.on('mouseout', function () {
  //   document.body.style.cursor = 'default';
  // });
  // sizer.on('mousedown', function() {
  //   group.setDraggable(false);
  //   sizer.setDraggable(true);
  // });
  // sizer.on('mouseup', function() {
  //   group.setDraggable(true);
  //   sizer.setDraggable(false);
  // });
  // sizer.on('dragmove', function(e) {
  //   var targetAbsPos = e.target.getAbsolutePosition();
  //   var newWidth = targetAbsPos.x - group.x() + LOGICAL_OPERATOR_SIZER_SIZE;
  //   var newHeight = targetAbsPos.y - group.y() + LOGICAL_OPERATOR_SIZER_SIZE;
  //   newWidth = Math.max(newWidth, LOGICAL_OPERATOR_MIN_SIZE);
  //   newHeight = Math.max(newHeight, LOGICAL_OPERATOR_MIN_SIZE);
  //   if (newWidth === LOGICAL_OPERATOR_MIN_SIZE) {
  //     sizer.setX(LOGICAL_OPERATOR_MIN_SIZE - LOGICAL_OPERATOR_SIZER_SIZE);
  //   }
  //   if (newHeight === LOGICAL_OPERATOR_MIN_SIZE) {
  //     sizer.setY(LOGICAL_OPERATOR_MIN_SIZE - LOGICAL_OPERATOR_SIZER_SIZE);
  //   }
  //   group.setWidth(newWidth);
  //   group.setHeight(newHeight);
  //   group.phemaObject().resizeShapeToGroup(group, scope);
  //   group.draw();
  // });
};

LogicalOperator.prototype.containedElements = function(elements) {
  if ('undefined' === typeof elements) {
    return this._containedElements;
  }
  else {
    this._containedElements = elements;
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

  // var tri = new Kinetic.Polygon({
  //   stroke: 'black', strokeWidth: 3,
  //   points: [60, 100, 90, 100, 90, 140]
  // });
  // var tri = new Kinetic.RegularPolygon({
  //   sides: 3, stroke: 'black', strokeWidth: 1, fill: 'black',
  //   x: mainRect.width() - 5, y: mainRect.height() - 5, radius: 5
  // });

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
};