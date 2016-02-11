'use strict';

/* globals updateSizeOfMainRect */

var FunctionOperator = function() {}
FunctionOperator.prototype = new BaseContainer;

var FUNCTION_OPERATOR_SIZER_SIZE = 7;
var FUNCTION_OPERATOR_MIN_SIZE = 100;

FunctionOperator.prototype.resizeShapeToGroup = function(group, scope) {
  var mainRect = group.find('.mainRect')[0];
  mainRect.setWidth(group.getWidth());
  mainRect.setHeight(group.getHeight());
  var header = group.find('.header')[0];
  header.setWidth(mainRect.getWidth());
  updateSizeOfMainRect(mainRect, group, group.getWidth(), group.getHeight());
};

FunctionOperator.prototype.calculateMinimumSize = function(group) {
  var farthestX = FUNCTION_OPERATOR_MIN_SIZE;
  var farthestY = FUNCTION_OPERATOR_MIN_SIZE;
  for (var index = 0; index < this._containedElements.length; index++) {
    var element = this._containedElements[index];
    farthestX = Math.max(element.getX() + element.getWidth(), farthestX);
    farthestY = Math.max(element.getY() + element.getHeight(), farthestY);
  }

  this._minimumSize = { width: farthestX + BORDER, height: farthestY + BORDER };
}

FunctionOperator.prototype.reconcileMinimumSize = function(group) {
  this.calculateMinimumSize(group);
  // var sizeBar = group.find('.sizer');
  // sizeBar.setX(group.width() - FUNCTION_OPERATOR_SIZER_SIZE);
  // sizeBar.setY(group.height() - FUNCTION_OPERATOR_SIZER_SIZE);
}

FunctionOperator.prototype.atCapacity = function() {
  return (this._containedElements && this._containedElements.length > 0);
}

// Connects the appropriate QDM subset operator shapes to event handlers.
// Used when constructing a new element, or when loading from a definition.
FunctionOperator.prototype.connectEvents = function(group, scope) {
  this.addStandardEventHandlers(group, scope);
  this.addCursorEventHandlers(group, scope);
  this.setDroppable(group.find('.mainRect')[0], ['Category', 'DataElement'], this.atCapacity);
  this.addConnectionHandler(group.find('.leftConnector')[0], scope);
  this.addConnectionHandler(group.find('.rightConnector')[0], scope);
  this.connectConnectorEvents(group);
  // var sizer = group.find('.sizer')[0];
  // this.addSizerEventHandlers(sizer, scope);
};

FunctionOperator.prototype.containedElements = function(elements) {
  if ('undefined' === typeof elements) {
    return this._containedElements;
  }
  else {
    this._containedElements = elements;
    this.calculateMinimumSize(this._container);
  }
};

FunctionOperator.prototype.attributes = function(attributes) {
  if ('undefined' === typeof attributes) {
    return this._attributes;
  }
  else {
    this._attributes = attributes;
  }
};

FunctionOperator.prototype.create = function(config, scope) {
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

FunctionOperator.prototype.toObject = function() {
  var obj = {};

  obj.containedElements = [];
  for (var index = 0; index < this._containedElements.length; index++) {
    obj.containedElements.push({id: this._containedElements[index]._id});
  }
  
  if (this._attributes) {
    obj.attributes = {};
    var attrKey;
    var attrValue;
    for (attrKey in this._attributes) {
      attrValue = this._attributes[attrKey];
      // Arrays are typically collections of value sets that need special handling
      // to avoid circular references
      if (attrValue instanceof Array) {
        obj.attributes[attrKey] = [];
        var index;
        for (index = 0; index < attrValue.length; index++) {
          // If it is the special type we expect, we custom format it.  Otherwise we just
          // write out the existing value
          if (attrValue[index].customList) {
            obj.attributes[attrKey].push({
              id: attrValue[index].id,
              name: attrValue[index].name,
              type: attrValue[index].type,
              customList: {terms: attrValue[index].customList.terms, valueSets: []}
            });
          }
          else {
            obj.attributes[attrKey].push(attrValue[index]);
          }
        }
      }
      else {
        obj.attributes[attrKey] = attrValue;
      }
    }
  }
  obj.className = 'FunctionOperator';
  return obj;
};

FunctionOperator.prototype.load = function(group, scope) {
  var obj = group.phemaObject();
  this.container(group);
  // Don't call the setter, it calls calculateMinimumSize which we can't do until after
  // we have associated all of the references
  this._containedElements = obj.containedElements;
  group.phemaObject(this);
  this.connectEvents(group, scope);

  // In addition to the base method for re-associating references, we also need to
  // associate our contained elements (if they were defined);
  this.associateReferences(group, scope);
  if (this._containedElements) {
    var groups = scope.canvasDetails.kineticStageObj.mainLayer.find('Group');
    var groupIndex;
    for (var index = 0; index < this._containedElements.length; index++) {
      var element = this._containedElements[index];
      if (element.id) {
        for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
          if (groups[groupIndex]._id === element.id) {
            this._containedElements[index] = groups[groupIndex];
            break;
          }
        }
      }
    }
  }
  else {
    this._containedElements = [];
  }

  if (obj.attributes) {
    this.attributes(obj.attributes);
  }
  else {
    this.attributes(null);
  }

  this.calculateMinimumSize(group);
};