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

  group.find('.termDropText')[0].on('click', function(e) {
    if (e.evt.which !== 3) {
      scope.$root.$broadcast('sophe-search-valuesets', e.target.parent);
    }
  });
};

DataElement.prototype._layoutElementsAfterTermDrop = function(valueSet) {
  var termDrop = this._container.find('.termDrop')[0];
  this._container.add(valueSet);

  // Position the value set at the term drop location
  valueSet.x(termDrop.x());
  valueSet.y(termDrop.y());

  // Now resize all of the elements in the object appropriately
  termDrop.width(valueSet.width());
  termDrop.height(valueSet.height());

  var termDropText = this._container.find('.termDropText')[0];
  termDropText.width(termDrop.width());
  termDropText.height(termDrop.height());

  var configRect = this._container.find('.config')[0];
  configRect.width(termDrop.width());
  configRect.y(termDrop.y() + termDrop.height() + 5);

  var mainRect = findObjectInPhemaGroupType('mainRect', this._container, ['Category', 'DataElement']);
  updateSizeOfMainRect(mainRect, this._container,
    (termDrop.width() + 20), (configRect.getY() + configRect.getHeight() + 10));

  var headerRect = findObjectInPhemaGroupType('header', this._container, ['Category', 'DataElement']);
  headerRect.width(mainRect.width());
};

// We keep the containedElements collection because some of our more general algorithms are
// able to leverage it.  The valueSet property is typically what we want to be using.
DataElement.prototype.containedElements = function(elements) {
  if ('undefined' === typeof elements) {
    return this._containedElements;
  }
  else {
    this._containedElements = elements;
    this._valueSet = (elements.length && elements.length > 0) ? elements[0] : null;
  }
};

DataElement.prototype.valueSet = function(valueSet) {
  if ('undefined' === typeof valueSet) {
    return this._valueSet;
  }
  else {
    this._valueSet = valueSet;
    if (valueSet) {
      this.containedElements([valueSet]);
      this._layoutElementsAfterTermDrop(valueSet);
    }
    else {
      this.containedElements([]);
    }
  }
};

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
      text: config.element.name, name: 'header',
      align: 'center', padding: 5
  };
  var headerObj = this.createText(headerOptions, group);

  var termStrokeColor = '#CCCCCC';
  var termStrokeWidth = 1;
  var termDropOptions = {
    x: options.x + 10, y: headerObj.height() + headerOptions.y + 5,
    width: options.width - 20, height: 75,
    fill: '#EEEEEE', name: 'termDrop',
    stroke: termStrokeColor, strokeWidth: termStrokeWidth
  };
  var termObj = this.createRectangle(termDropOptions, group);

  var termTextOptions = {
    x: termDropOptions.x, y: termDropOptions.y,
    width: termObj.width(), height: termObj.height(),
    fontFamily: 'Calibri', fontSize: 14, fill: 'gray',
    text: 'Drag and drop clinical terms or value sets here, or click to search',
    align: 'center', padding: 5, name: 'termDropText',
  };
  var termTextObj = this.createText(termTextOptions, group);
  
  termTextObj.on('mouseover', function (e) {
    termObj.setStrokeWidth(3);
    termObj.setStroke('#AAAAAA');
    termObj.getParent().draw();
  });
  termTextObj.on('mouseout', function (e) {
    termObj.setStrokeWidth(termStrokeWidth);
    termObj.setStroke(termStrokeColor);
    termObj.getParent().draw();
  });

  var configOptions = {
    x: termDropOptions.x, y: termObj.height() + termDropOptions.y + 5,
    width: termDropOptions.width, height: termDropOptions.height,
    fill: '#EEEEEE', name: 'config',
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

  var mainLayer = scope.canvasDetails.kineticStageObj.mainLayer;
  mainLayer.add(group);
  mainLayer.draw();
};

DataElement.prototype.toObject = function() {
  var obj = {};
  if (this._valueSet) {
    obj.valueSet = {id: this._valueSet._id};
  }
  obj.className = 'DataElement';
  return obj;
};

DataElement.prototype.load = function(group, scope) {
  var obj = group.phemaObject();
  this.container(group);
  group.phemaObject(this);
  this.connectEvents(group, scope);

  // In addition to the base method for re-associating references, we also need to
  // associate our value set (if it was defined);
  this.associateReferences(group, scope);
  if (obj.valueSet && obj.valueSet.id) {
    var groups = scope.canvasDetails.kineticStageObj.mainLayer.find('Group');
    for (var index = 0; index < groups.length; index++) {
      if (groups[index]._id === obj.valueSet.id) {
        this.valueSet(groups[index]);
        break;
      }
    }
  }
  else {
    this.valueSet(null);
  }
};