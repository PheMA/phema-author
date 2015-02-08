'use strict';

describe('Factory: AlgorithmElementFactory', function () {

  beforeEach(module('sopheAuthorApp'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_algorithmElementFactory_, $rootScope) {
    this.algorithmElementFactory = _algorithmElementFactory_;
    this.scope = $rootScope.$new();

    spyOn(console, 'log');
    spyOn(console, 'debug');
    spyOn(console, 'error');
  }));

  beforeEach(inject(function (kineticStageFactory, $rootScope, $compile) {
    angular.element(document.body).append('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
    var linkingFn = $compile('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
    linkingFn(this.scope);
    kineticStageFactory.create(this.scope, {id: 'canvas'});
  }));

  describe('addWorkflowObject', function() {
    it('returns null when there is no canvas', inject(function() {
      this.scope = {};
      this.algorithmElementFactory.addWorkflowObject(null, this.scope);
      expect(console.error).toHaveBeenCalledWith('No canvas is defined');
    }));

    it('handles null configuration', inject(function() {
      this.scope.canvasDetails = {};
      this.algorithmElementFactory.addWorkflowObject(null, this.scope);
      expect(console.error).toHaveBeenCalledWith('No element definition was provided');
    }));

    it('handles empty configuration', inject(function() {
      var config = {};
      this.scope.canvasDetails = {};
      this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(console.error).toHaveBeenCalledWith('No element definition was provided');
    }));

    it('creates a temporal operator', inject(function() {
      var config = {element: {type: 'TemporalOperator', name: 'Concurrent with'}};
      var response = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(response.nodeType).toEqual('Group');
      expect(this.scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(2);
      expect(response.find('.rightConnector').length).toEqual(2);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a data element', inject(function() {
      var config = {element: {type: 'DataElement', name: 'Element'}};
      var response = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(response.nodeType).toEqual('Group');
      expect(this.scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a category', inject(function() {
      var config = {element: {type: 'Category', name: 'Category'}};
      var response = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(response.nodeType).toEqual('Group');
      expect(this.scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a logical operator', inject(function() {
      var config = {element: {type: 'LogicalOperator', name: 'LogicalOperator'}};
      var response = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(response.nodeType).toEqual('Group');
      expect(this.scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a phenotype', inject(function() {
      var config = {element: {type: 'Phenotype', name: 'Phenotype'}};
      var response = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(response.nodeType).toEqual('Group');
      expect(this.scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a generic element', inject(function() {
      var config = {element: {type: 'Phenotype', name: 'Phenotype'}};
      var response = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(response.nodeType).toEqual('Group');
      expect(this.scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a value set', inject(function() {
      var config = {element: {type: 'ValueSet', name: 'Value set'}};
      var response = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(response.nodeType).toEqual('Group');
      expect(this.scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(0);
      expect(response.find('.rightConnector').length).toEqual(0);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a term', inject(function() {
      var config = {element: {type: 'Term', name: 'Term'}};
      var response = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(response.nodeType).toEqual('Group');
      expect(this.scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(0);
      expect(response.find('.rightConnector').length).toEqual(0);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('drops a term on a data element', inject(function() {
      var config = {x: 1, y: 1, element: {type: 'DataElement', name: 'Element'}};
      var element = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(element.phemaObject().valueSet()).toEqual(null);
      config = {x: 55, y: 55, element: {type: 'Term', name: 'Term'}};
      var term = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(element.phemaObject().valueSet()).toNotEqual(null);
    }));

    it('does not drop a phenotype on a data element', inject(function() {
      var config = {x: 1, y: 1, element: {type: 'DataElement', name: 'Element'}};
      var element = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(element.phemaObject().valueSet()).toEqual(null);
      config = {x: 55, y: 55, element: {type: 'Phenotype', name: 'Phenotype'}};
      var term = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(element.phemaObject().valueSet()).toEqual(null);
    }));
  });

  describe('deleteSelectedObjects', function() {
    it('does not throw an error if there is no canvas', inject(function() {
      this.scope = {};
      this.algorithmElementFactory.deleteSelectedObjects(this.scope);
      expect(console.error).toHaveBeenCalledWith('No canvas is defined');
    }));

    it('deletes only selected groups', inject(function() {
      var config = {element: {type: 'Phenotype', name: 'Phenotype'}};
      var item1 = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      var item2 = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      var item3 = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      item2.selected = true;
      expect(this.scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(3);
      this.algorithmElementFactory.deleteSelectedObjects(this.scope);
      expect(this.scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(2);
    }));

    it('deletes only selected connections', inject(function() {
      var config = {element: {type: 'TemporalOperator', name: 'Concurrent with'}};
      var item1 = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      var item2 = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      var item3 = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      expect(this.scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection').length).toEqual(3);
      this.scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection')[0].selected = true;
      this.algorithmElementFactory.deleteSelectedObjects(this.scope);
      expect(this.scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection').length).toEqual(2);
    }));

    it('deletes nothing if nothing is selected', inject(function() {
      var config1 = {element: {type: 'TemporalOperator', name: 'Concurrent with'}};
      this.algorithmElementFactory.addWorkflowObject(config1, this.scope);
      var config2 = {element: {type: 'Phenotype', name: 'Phenotype'}};
      this.algorithmElementFactory.addWorkflowObject(config2, this.scope);
      expect(this.scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection').length).toEqual(1);
      expect(this.scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(4);
      this.algorithmElementFactory.deleteSelectedObjects(this.scope);
      expect(this.scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection').length).toEqual(1);
      expect(this.scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(4);
    }));
  });

  describe('getFirstSelectedItem', function() {
    it('returns null if there is no canvas', inject(function() {
      this.scope = {};
      expect(this.algorithmElementFactory.getFirstSelectedItem(this.scope)).toBe(null);
    }));

    it('returns null if there are no objects', inject(function() {
      expect(this.algorithmElementFactory.getFirstSelectedItem(this.scope)).toBe(null);
    }));

    it('returns the first if multiple are selected', inject(function() {
      expect(this.algorithmElementFactory.getFirstSelectedItem(this.scope)).toBe(null);
      var config = {element: {type: 'Phenotype', name: 'Phenotype'}};
      var item1 = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      var item2 = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      var item3 = this.algorithmElementFactory.addWorkflowObject(config, this.scope);
      item2.selected = true;
      expect(this.algorithmElementFactory.getFirstSelectedItem(this.scope)).toBe(item2);
    }));
  });
});