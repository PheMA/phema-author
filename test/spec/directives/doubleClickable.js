'use strict';

describe('Directive: doubleClickable', function () {
  beforeEach(module('sophe.doubleClickable'));
  beforeEach(module('sopheAuthorApp'));
  beforeEach(inject(function ($compile, $rootScope, $httpBackend) {
    this.compile = $compile;
    this.rootScope = $rootScope;
    this.rootScope.clickTest = function() { var test = 1; };
  }));

  it('handles if there is no callback function', function() {
    var element = angular.element('<div double-clickable>Test<input type="hidden" value="&quot;{}&quot;"></input></div>');
    this.compile(element)(this.rootScope); // Compile the directive
    spyOn(this.rootScope, 'clickTest').andCallThrough();
    this.rootScope.$digest(); // Update the HTML
    $(element).trigger('dblclick');
    expect(this.rootScope.clickTest.calls.length).toEqual(0);
  });

  it('calls the callback function', function() {
    var element = angular.element('<div double-clickable dblclick-event="clickTest()">Test<input type="hidden" value="&quot;{}&quot;"></input></div>');
    this.compile(element)(this.rootScope);
    spyOn(this.rootScope, 'clickTest').andCallThrough();
    this.rootScope.$digest();
    $(element).trigger('dblclick');
    expect(this.rootScope.clickTest.calls.length).toEqual(1);
  });
});