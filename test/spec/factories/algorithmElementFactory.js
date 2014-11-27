'use strict';

describe('Factory: AlgorithmElementFactory', function () {

  // load the controller's module
  // beforeEach(module('ui.bootstrap'));
  // beforeEach(module('treeControl'));
  beforeEach(module('sopheAuthorApp'));

  var algorithmElementFactory, scope, dragElement, dropElement;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_algorithmElementFactory_, $rootScope) {
    algorithmElementFactory = _algorithmElementFactory_;
    scope = $rootScope.$new();
    dragElement = { droppable: false, element: {} };
    dropElement = { droppable: true, element: {}, droppableElementTypes: [] };

    spyOn(console, 'log');
    spyOn(console, 'debug');
    spyOn(console, 'error');
  }));

  describe('allowsDrop', function() {
    it('handles null params', inject(function () {
      var response = algorithmElementFactory.allowsDrop(null, null);
      expect(response).toEqual(false);
      expect(console.error).toHaveBeenCalledWith('No drag or drop element was specified');
    }));

    it('ignores drops for non-droppable items', inject(function () {
      dropElement.droppable = false;
      var response = algorithmElementFactory.allowsDrop(dragElement, dropElement);
      expect(response).toEqual(false);
      expect(console.error).toHaveBeenCalledWith('This element is not configured to accept drops');
    }));

    it('ignores drops for misconfigured items', inject(function () {
      var response = algorithmElementFactory.allowsDrop(dragElement, dropElement);
      expect(response).toEqual(false);
      expect(console.error).toHaveBeenCalledWith('This element is not configured to accept drops');
    }));

    it('allows appropriate drops for configured array', inject(function () {
      dropElement.element.type = 'LogicalOperator';
      dropElement.droppableElementTypes = ['Category'];
      dragElement.element.type = 'Category';
      var response = algorithmElementFactory.allowsDrop(dragElement, dropElement);
      expect(response).toEqual(true);
    }));

    it('ignores inappropriate drops for configured array', inject(function () {
      dropElement.element.type = 'LogicalOperator';
      dropElement.droppableElementTypes = ['Category'];
      dragElement.element.type = 'DataElement';
      var response = algorithmElementFactory.allowsDrop(dragElement, dropElement);
      expect(response).toEqual(false);
    }));
  });

  describe('addWorkflowObject', function() {
    beforeEach(inject(function (_algorithmElementFactory_, $rootScope) {
      scope.canvasDetails = {};
    }));

    it('returns null when there is no canvas', inject(function() {
      scope = {};
      var response = algorithmElementFactory.addWorkflowObject(null, scope);
      expect(console.error).toHaveBeenCalledWith('No canvas is defined');
    }));

    it('handles null configuration', inject(function() {
      var response = algorithmElementFactory.addWorkflowObject(null, scope);
      expect(console.error).toHaveBeenCalledWith('No element definition was provided');
    }));

    it('handles empty configuration', inject(function() {
      var config = {};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
      expect(console.error).toHaveBeenCalledWith('No element definition was provided');
    }));

    it('creates a temporal operator', inject(function() {
      var config = {element: {type: 'TemporalOperator'}};
      var response = algorithmElementFactory.addWorkflowObject(config, scope);
    }));
  });
});