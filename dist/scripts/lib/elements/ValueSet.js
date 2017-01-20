'use strict';

var ValueSet = function() {}
ValueSet.prototype = new BaseElement;

// Connects the appropriate QDM logical operator shapes to event handlers.
// Used when constructing a new element, or when loading from a definition.
ValueSet.prototype.connectEvents = function(group, scope) {
  this.addStandardEventHandlers(group, scope);
  this.addCursorEventHandlers(group, scope);
};

ValueSet.prototype.create = function(config, scope) {
  var options = {
    x: 0, y: 0, width: 175, height: 100,
    fill: '#eedbf4', name: 'mainRect',
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
  workflowObj.setHeight(headerObj.getHeight() + 10);

  // var idOptions = {
  //   x: options.x, y: options.y + headerObj.getHeight() + 5,
  //   width: options.width, // Leave out height so it auto-sizes
  //   fontFamily: 'Calibri', fontSize: 11, fill: 'black',
  //   text: 'OID: ' + config.element.id, name: 'oid',
  //   align: 'center', padding: 5
  // };
  // var idObj = this.createText(idOptions, group);
  // workflowObj.setHeight(headerObj.getHeight() + idObj.getHeight() + 10);

  // Now that the shape is built, define the bounds of the group
  group.setWidth(workflowObj.getWidth());
  group.setHeight(workflowObj.getHeight());

  this.connectEvents(group, scope);

  var mainLayer = scope.canvasDetails.kineticStageObj.mainLayer;
  mainLayer.add(group);
  mainLayer.draw();
};

ValueSet.prototype.container = function(container) {
  if ('undefined' === typeof container) {
    return this._container;
  }
  else {
    this._container = container;
  }
};

ValueSet.prototype.customList = function(items) {
  if ('undefined' === typeof items) {
    return this._customList;
  }
  else {
    this._customList = items;
  }
};

ValueSet.prototype.toObject = function() {
  var obj = {className: Constants.ElementTypes.VALUE_SET};
  if (this._customList) {
    obj.customList = this._customList;
  }
  return obj;
};

ValueSet.prototype.load = function(group, scope) {
  var obj = group.phemaObject();
  this.container(group);
  this.customList(obj.customList);
  group.phemaObject(this);
  this.connectEvents(group, scope);
  this.associateReferences(group, scope);
};

// Global utility function to create an element configuration object, given a set of
// value sets and terms.
ValueSet.createElementFromData = function(result) {
  var element = {};
  if (result) {
    // If we just have a value set, we will create that and place it in the object
    if (result.valueSets && result.valueSets.length > 0 && (!result.terms || result.terms.length === 0)) {
      element = result.valueSets[0];
    }
    else if (result.newValueSet){
      // If there is an OID, it means it was saved in a local repository, so we'll treat it normal
      if (result.newValueSet.oid && result.newValueSet.oid !== '') {
        element = {
            id: result.newValueSet.oid,
            name: result.newValueSet.name,
            terms: result.newValueSet.terms,
            valueSetRepository: result.newValueSet.valueSetRepository,
            type: Constants.ElementTypes.VALUE_SET
        };
      }
      // If there is an id attribute, that means it was saved to our CTS2 repository and can be loaded as-is.
      else if (result.newValueSet.id && result.newValueSet.id !== '') {
        element = result.newValueSet;
      }
      // Otherwise we are going to build a temporary value set based on this collection
      else {
        element = {
            id: '',
            name: 'Custom Value Set \r\n(' + result.terms.length + ' term' + (result.terms.length == 1 ? '' : 's') +')',
            customList: result.newValueSet.terms,
            type: Constants.ElementTypes.VALUE_SET
        };
      }
    }
  }
  return element;
}