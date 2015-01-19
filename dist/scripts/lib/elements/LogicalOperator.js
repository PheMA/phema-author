'use strict';

var LogicalOperator = function() {}
LogicalOperator.prototype = new BaseElement;

// Connects the appropriate QDM logical operator shapes to event handlers.
// Used when constructing a new element, or when loading from a definition.
LogicalOperator.prototype.connectEvents = function(group, scope) {
  this.addStandardEventHandlers(group, scope);
  this.addCursorEventHandlers(group, scope);
  this.setDroppable(group.find('.mainRect')[0], ['Category', 'DataElement', 'LogicalOperator']);
  this.addConnectionHandler(group.find('.leftConnector')[0], scope);
  this.addConnectionHandler(group.find('.rightConnector')[0], scope);
  this.connectConnectorEvents(group);
};

LogicalOperator.prototype.containedElements = function(elements) {
  if ('undefined' === typeof elements) {
    return this._containedElements;
  }
  else {
    this._containedElements = elements;
  }
}

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

  this.connectEvents(group, scope);

  this.containedElements([]);
  var mainLayer = scope.canvasDetails.kineticStageObj.mainLayer;
  mainLayer.add(group);
  mainLayer.draw();
};

LogicalOperator.prototype.container = function() {
  return this._container;
};

LogicalOperator.prototype.toObject = function() {
  var obj = {};

  obj.containedElements = [];
  for (var index = 0; index < this._containedElements.length; index++) {
    obj.containedElements.push({id: this._containedElements[index]._id});
  }
  obj.className = 'LogicalOperator';
  return obj;
}

LogicalOperator.prototype.load = function(group, scope) {
  var obj = group.phemaObject();
  this.containedElements(obj.containedElements);
  this.container(group);
  group.phemaObject(this);
  this.connectEvents(group, scope);
  this.associateReferences(group, scope);
}