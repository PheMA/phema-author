'use strict';

var DataElement = function() {}
DataElement.prototype = new BaseElement;

// Connects the appropriate QDM logical operator shapes to event handlers.
// Used when constructing a new element, or when loading from a definition.
DataElement.prototype.connectEvents = function(group, scope) {
  this.addStandardEventHandlers(group, scope);
  this.addCursorEventHandlers(group, scope);
  var termObj = group.find('.termDrop')[0];
  this.setDroppable(termObj, ['ValueSet', 'Term']);
  this.addConnectionHandler(group.find('.leftConnector')[0], scope);
  this.addConnectionHandler(group.find('.rightConnector')[0], scope);
  this.connectConnectorEvents(group);
};

DataElement.prototype.containedElements = function(elements) {
  if ('undefined' === typeof elements) {
    return this._containedElements;
  }
  else {
    this._containedElements = elements;
  }
}

DataElement.prototype.create = function(config, scope) {
  var options = {
      x: 0, y: 0, width: 175, height: 200,
      fill: '#dbeef4', name: 'mainRect',
      stroke: 'black', strokeWidth: 1
  };

  var group = new Kinetic.PhemaGroup({
    draggable: true,
    x: ((config && config.x) ? config.x : 50),
    y: ((config && config.y) ? config.y : 50)});
  this._container = group;
  group.phemaObject(this);

  var mainRect = this.createRectangle(options, group);

  var headerOptions = {
      x: options.x, y: options.y,
      width: options.width, // Leave out height so it auto-sizes
      fontFamily: 'Calibri', fontSize: 14, fill: 'black',
      text: config.element.name,
      align: 'center', padding: 5
  };
  var headerObj = this.createText(headerOptions, group);

  var termDropOptions = {
    x: options.x + 10, y: headerObj.height() + headerOptions.y + 5,
    width: options.width - 20, height: 75,
    fill: '#EEEEEE', name: 'termDrop',
    stroke: '#CCCCCC', strokeWidth: 1
  };
  var termObj = this.createRectangle(termDropOptions, group);

  var termTextOptions = {
    x: termDropOptions.x, y: termDropOptions.y,
    width: termObj.width(), height: termObj.height(),
    fontFamily: 'Calibri', fontSize: 14, fill: 'gray',
    text: 'Drag and drop clinical terms or value sets here, or search for terms',
    align: 'center', padding: 5
  };
  this.createText(termTextOptions, group);

  var configOptions = {
    x: termDropOptions.x, y: termObj.height() + termDropOptions.y + 5,
    width: termDropOptions.width, height: termDropOptions.height,
    fill: '#EEEEEE',
    stroke: '#CCCCCC', strokeWidth: 1
  };
  var configObj = this.createRectangle(configOptions, group);

  // Resize the main container to ensure consistent spacing regardless of the
  // height of internal components.
  mainRect.setHeight(configObj.getY() + configObj.getHeight() - options.y + 10);

  this.addConnectors(scope, mainRect, group);

  this.connectEvents(group, scope);

  // Now that the shape is built, define the bounds of the group
  group.setWidth(mainRect.getWidth());
  group.setHeight(mainRect.getHeight());

  var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
  mainLayer.add(group);
  mainLayer.draw();
};

DataElement.prototype.container = function() {
  return this._container;
};

DataElement.prototype.toObject = function() {
  var obj = {className: 'DataElement'};
  return obj;
}

DataElement.prototype.load = function(group, scope) {
  var obj = group.phemaObject();
  this.container(group);
  group.phemaObject(this);
  this.connectEvents(group, scope);
  this.associateReferences(group, scope);
}