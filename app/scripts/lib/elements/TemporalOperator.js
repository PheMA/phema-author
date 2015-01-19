'use strict';
var TemporalOperator = function() {}
TemporalOperator.prototype = new BaseElement;

// Connects the appropriate QDM logical operator shapes to event handlers.
// Used when constructing a new element, or when loading from a definition.
TemporalOperator.prototype.connectEvents = function(group, scope) {
  var allowedTemporalDropTypes = ['Category', 'DataElement', 'LogicalOperator', 'Phenotype'];
  this.addStandardEventHandlers(group, scope);
  this.addCursorEventHandlers(group, scope);
  var eventA = group.find('.eventA')[0];
  var connectorOffset = 0;
  if (eventA) {
    connectorOffset = 1;
    this.setDroppable(eventA, allowedTemporalDropTypes);
    this.addConnectionHandler(group.find('.leftConnector')[0], scope);
    this.addConnectionHandler(group.find('.rightConnector')[0], scope);
  }

  var eventB = group.find('.eventB')[0];
  if (eventB) {
    this.setDroppable(group.find('.eventB')[0], allowedTemporalDropTypes);
    this.addConnectionHandler(group.find('.leftConnector')[connectorOffset], scope);
    this.addConnectionHandler(group.find('.rightConnector')[connectorOffset], scope);
  }
  this.connectConnectorEvents(group);
};

TemporalOperator.prototype.containedElements = function(elements) {
  if ('undefined' === typeof elements) {
    return this._containedElements;
  }
  else {
    this._containedElements = elements;
  }
}

TemporalOperator.prototype.create = function(config, scope) {
  var group = new Kinetic.PhemaGroup({
    draggable: true,
    x: ((config && config.x) ? config.x : 50),
    y: ((config && config.y) ? config.y : 50)});
  this._container = group;
  group.phemaObject(this);

  var spacing = 75;
  var options = {
      x: 0, y: 0, width: 175, height: 175,
      fill: 'white', name: 'eventA',
      stroke: 'gray', strokeWidth: 1
  };
  var eventA = this.createRectangle(options, group);
  eventA.dash([10, 5]);
  eventA.dashEnabled(true);

  var eventAConnectors = this.addConnectors(scope, eventA, group);

  var headerOptions = {
      x: options.x, y: options.y,
      width: options.width, // Leave out height so it auto-sizes
      fontFamily: 'Calibri', fontSize: 18, fill: 'black',
      text: 'Event A', name: 'eventALabel',
      align: 'center', padding: 5
  };
  var eventAText = this.createText(headerOptions, group);
  this.createText({
    x: eventAText.getX(), y: eventAText.getY() + eventAText.getHeight() + 25,
    width: options.width, // Leave out height so it auto-sizes
    fontFamily: 'Calibri', fontSize: 14, fill: 'black', name: 'eventAText',
    text: '(Drag and drop a data element here to define the event)',
    align: 'center', padding: 5}, group);

  options.x = options.x + options.width + spacing;
  options.name = 'eventB';
  var eventB = this.createRectangle(options, group);
  eventB.dash([10, 5]);
  eventB.dashEnabled(true);

  var eventBConnectors = this.addConnectors(scope, eventB, group);

  headerOptions.x = options.x;
  headerOptions.y = options.y;
  headerOptions.text = 'Event B';
  headerOptions.name = 'eventBLabel';
  var eventBText = this.createText(headerOptions, group);
  this.createText({
    x: eventBText.getX(), y: eventBText.getY() + eventBText.getHeight() + 25,
    width: options.width, // Leave out height so it auto-sizes
    fontFamily: 'Calibri', fontSize: 14, fill: 'black', name: 'eventBText',
    text: '(Drag and drop a data element here to define the event)',
    align: 'center', padding: 5}, group);

  var stage = scope.canvasDetails.kineticStageObj;
  startConnector(stage, eventAConnectors[1]);
  var line = endConnector(stage, eventBConnectors[0], scope);
  updateConnectedLines(eventAConnectors[1], stage);
  if (line !== null) {
    line.label().setText(config.element.name);
    line.element(config.element);
  }

  this.connectEvents(group, scope);

  // Now that the shape is built, define the bounds of the group
  group.setWidth(eventB.getX() + eventB.getWidth() - eventA.getX());
  group.setHeight(eventA.getHeight());

  var mainLayer = stage.find('#mainLayer');
  mainLayer.add(group);
  mainLayer.draw();
};

TemporalOperator.prototype.container = function() {
  return this._container;
};

TemporalOperator.prototype.toObject = function() {
  var obj = {className: 'TemporalOperator'};
  return obj;
}

TemporalOperator.prototype.load = function(group, scope) {
  var obj = group.phemaObject();
  this.container(group);
  group.phemaObject(this);
  this.connectEvents(group, scope);
  this.associateReferences(group, scope);
}