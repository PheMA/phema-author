'use strict';

describe('UI Util', function () {
  var Element = function(droppable) {
    this.droppable = droppable;
    this.droppableElementTypes = [];
    this.elementDef = {type: ''};
  };
  Element.prototype.element = function(element) {
    if (typeof element === 'undefined') {
      return this.elementDef;
    }
    else {
      this.elementDef = element;
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function () {
    this.dragElement = new Element(false);
    this.dropElement = new Element(true);

    spyOn(console, 'log');
    spyOn(console, 'debug');
    spyOn(console, 'error');
  }));

  describe('allowsDrop', function() {
    it('handles null params', inject(function () {
      var response = allowsDrop(null, null);
      expect(response).toEqual(false);
      expect(console.error).toHaveBeenCalledWith('No drag or drop element was specified');
    }));

    it('ignores drops for non-droppable items', inject(function () {
      this.dropElement.droppable = false;
      var response = allowsDrop(this.dragElement, this.dropElement);
      expect(response).toEqual(false);
      expect(console.error).toHaveBeenCalledWith('This element is not configured to accept drops');
    }));

    it('ignores drops for misconfigured items', inject(function () {
      var response = allowsDrop(this.dragElement, this.dropElement);
      expect(response).toEqual(false);
      expect(console.error).toHaveBeenCalledWith('This element is not configured to accept drops');
    }));

    it('allows appropriate drops for configured array', inject(function () {
      var elementObj = this.dropElement.element();
      elementObj.type = 'LogicalOperator';
      this.dropElement.droppableElementTypes = ['Category'];
      this.dropElement.element(elementObj);

      elementObj = this.dragElement.element();
      elementObj.type = 'Category';
      this.dragElement.element(elementObj);

      var response = allowsDrop(this.dragElement, this.dropElement);
      expect(response).toEqual(true);
    }));

    it('ignores inappropriate drops for configured array', inject(function () {
      var elementObj = this.dropElement.element()
      elementObj.type = 'LogicalOperator';
      this.dropElement.droppableElementTypes = ['Category'];
      this.dropElement.element(elementObj);

      elementObj = this.dragElement.element();
      elementObj.type = 'DataElement';
      this.dragElement.element(elementObj);
      var response = allowsDrop(this.dragElement, this.dropElement);
      expect(response).toEqual(false);
    }));
  });
});