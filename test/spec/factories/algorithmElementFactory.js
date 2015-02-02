'use strict';

describe('Factory: AlgorithmElementFactory', function () {

  beforeEach(module('sopheAuthorApp'));

  var algorithmElementFactory, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_algorithmElementFactory_, $rootScope) {
    algorithmElementFactory = _algorithmElementFactory_;
    scope = $rootScope.$new();

    spyOn(console, 'log');
    spyOn(console, 'debug');
    spyOn(console, 'error');
  }));

  beforeEach(inject(function (kineticStageFactory, $rootScope, $compile) {
    angular.element(document.body).append('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
    var linkingFn = $compile('<div data-kinetic-canvas data-canvas-details="canvasDetails" id="canvas">&nbsp;</div>');
    linkingFn(scope);
    kineticStageFactory.create(scope, {id: 'canvas'});
  }));

  describe('addWorkflowObject', function() {
    it('returns null when there is no canvas', inject(function() {
      scope = {};
      algorithmElementFactory.addWorkflowObject(null, scope);
      expect(console.error).toHaveBeenCalledWith('No canvas is defined');
    }));

    it('handles null configuration', inject(function() {
      scope.canvasDetails = {};
      algorithmElementFactory.addWorkflowObject(null, scope);
      expect(console.error).toHaveBeenCalledWith('No element definition was provided');
    }));

    it('handles empty configuration', inject(function() {
      var config = {};
      scope.canvasDetails = {};
      algorithmElementFactory.addWorkflowObject(config, scope);
      expect(console.error).toHaveBeenCalledWith('No element definition was provided');
    }));

    it('creates a temporal operator', inject(function() {
      var config = {element: {type: 'TemporalOperator', name: 'Concurrent with'}};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(response.nodeType).toEqual('Group');
      expect(scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(2);
      expect(response.find('.rightConnector').length).toEqual(2);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a data element', inject(function() {
      var config = {element: {type: 'DataElement', name: 'Element'}};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(response.nodeType).toEqual('Group');
      expect(scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a category', inject(function() {
      var config = {element: {type: 'Category', name: 'Category'}};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(response.nodeType).toEqual('Group');
      expect(scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a logical operator', inject(function() {
      var config = {element: {type: 'LogicalOperator', name: 'LogicalOperator'}};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(response.nodeType).toEqual('Group');
      expect(scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a phenotype', inject(function() {
      var config = {element: {type: 'Phenotype', name: 'Phenotype'}};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(response.nodeType).toEqual('Group');
      expect(scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a generic element', inject(function() {
      var config = {element: {type: 'Phenotype', name: 'Phenotype'}};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(response.nodeType).toEqual('Group');
      expect(scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(1);
      expect(response.find('.rightConnector').length).toEqual(1);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a value set', inject(function() {
      var config = {element: {type: 'ValueSet', name: 'Value set'}};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(response.nodeType).toEqual('Group');
      expect(scope.canvasDetails.kineticStageObj.find('#mainLayer').getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(0);
      expect(response.find('.rightConnector').length).toEqual(0);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));

    it('creates a term', inject(function() {
      var config = {element: {type: 'Term', name: 'Term'}};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(response.nodeType).toEqual('Group');
      expect(scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(1);
      expect(response.find('.leftConnector').length).toEqual(0);
      expect(response.find('.rightConnector').length).toEqual(0);
      expect(response.element().type).toEqual(config.element.type);
      expect(response.element().name).toEqual(config.element.name);
    }));
  });

  describe('deleteSelectedObjects', function() {
    it('does not throw an error if there is no canvas', inject(function() {
      scope = {};
      algorithmElementFactory.deleteSelectedObjects(scope);
      expect(console.error).toHaveBeenCalledWith('No canvas is defined');
    }));

    it('deletes only selected groups', inject(function() {
      var config = {element: {type: 'Phenotype', name: 'Phenotype'}};
      var item1 = algorithmElementFactory.addWorkflowObject(config, scope);
      var item2 = algorithmElementFactory.addWorkflowObject(config, scope);
      var item3 = algorithmElementFactory.addWorkflowObject(config, scope);
      item2.selected = true;
      expect(scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(3);
      algorithmElementFactory.deleteSelectedObjects(scope);
      expect(scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(2);
    }));

    it('deletes only selected connections', inject(function() {
      var config = {element: {type: 'TemporalOperator', name: 'Concurrent with'}};
      var item1 = algorithmElementFactory.addWorkflowObject(config, scope);
      var item2 = algorithmElementFactory.addWorkflowObject(config, scope);
      var item3 = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection').length).toEqual(3);
      scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection')[0].selected = true;
      algorithmElementFactory.deleteSelectedObjects(scope);
      expect(scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection').length).toEqual(2);
    }));

    it('deletes nothing if nothing is selected', inject(function() {
      var config1 = {element: {type: 'TemporalOperator', name: 'Concurrent with'}};
      algorithmElementFactory.addWorkflowObject(config1, scope);
      var config2 = {element: {type: 'Phenotype', name: 'Phenotype'}};
      algorithmElementFactory.addWorkflowObject(config2, scope);
      expect(scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection').length).toEqual(1);
      expect(scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(4);
      algorithmElementFactory.deleteSelectedObjects(scope);
      expect(scope.canvasDetails.kineticStageObj.mainLayer.find('PhemaConnection').length).toEqual(1);
      expect(scope.canvasDetails.kineticStageObj.mainLayer.getChildren().length).toEqual(4);
    }));
  });

  describe('getFirstSelectedItem', function() {
    it('returns null if there is no canvas', inject(function() {
      scope = {};
      expect(algorithmElementFactory.getFirstSelectedItem(scope)).toBe(null);
    }));

    it('returns null if there are no objects', inject(function() {
      expect(algorithmElementFactory.getFirstSelectedItem(scope)).toBe(null);
    }));

    it('returns the first if multiple are selected', inject(function() {
      expect(algorithmElementFactory.getFirstSelectedItem(scope)).toBe(null);
      var config = {element: {type: 'Phenotype', name: 'Phenotype'}};
      var item1 = algorithmElementFactory.addWorkflowObject(config, scope);
      var item2 = algorithmElementFactory.addWorkflowObject(config, scope);
      var item3 = algorithmElementFactory.addWorkflowObject(config, scope);
      item2.selected = true;
      expect(algorithmElementFactory.getFirstSelectedItem(scope)).toBe(item2);
    }));
  });
});