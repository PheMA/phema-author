'use strict';

var PhenotypeElement = function() {}
PhenotypeElement.prototype = new BaseElement;

// Connects the appropriate QDM logical operator shapes to event handlers.
// Used when constructing a new element, or when loading from a definition.
PhenotypeElement.prototype.connectEvents = function(group, scope) {
  this.addStandardEventHandlers(group, scope);
  this.addCursorEventHandlers(group, scope);
  this.addConnectionHandler(group.find('.leftConnector')[0], scope);
  this.addConnectionHandler(group.find('.rightConnector')[0], scope);
  this.connectConnectorEvents(group);
};

PhenotypeElement.prototype.containedElements = function(elements) {
  if ('undefined' === typeof elements) {
    return this._containedElements;
  }
  else {
    this._containedElements = elements;
  }
};

PhenotypeElement.prototype.create = function(config, scope) {
  var options = {
    x: 0, y: 0, width: 175, height: 100,
    fill: '#dbeef4', name: 'mainRect',
    stroke: 'black', strokeWidth: 1
  };

  var group = new Kinetic.PhemaGroup({
    draggable: true,
    x: ((config && config.x) ? config.x : 50),
    y: ((config && config.y) ? config.y : 50)});
  this._container = group;
  group.phemaObject(this);

  var workflowObj = this.createRectangle(options, group);

  var headerOptions = {
    x: options.x, y: options.y,
    width: options.width, // Leave out height so it auto-sizes
    fontFamily: 'Calibri', fontSize: 14, fill: 'black',
    text: config.element.name, name: 'header',
    align: 'center', padding: 5
  };
  var headerObj = this.createText(headerOptions, group);

  workflowObj.setHeight(headerObj.getHeight() + 30);

  // Now that the shape is built, define the bounds of the group
  group.setWidth(workflowObj.getWidth());
  group.setHeight(workflowObj.getHeight());

  this.addConnectors(scope, workflowObj, group);

  this.connectEvents(group, scope);

  var mainLayer = scope.canvasDetails.kineticStageObj.mainLayer;
  mainLayer.add(group);
  mainLayer.draw();
};

PhenotypeElement.prototype.toObject = function() {
  var obj = {className: Constants.ElementTypes.PHENOTYPE};
  return obj;
};

PhenotypeElement.prototype.load = function(group, scope) {
  var obj = group.phemaObject();
  this.container(group);
  group.phemaObject(this);
  this.connectEvents(group, scope);
  this.associateReferences(group, scope);
};