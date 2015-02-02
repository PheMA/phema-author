'use strict';

describe('Directive: codeSystems', function () {
  beforeEach(module('sophe.elements.codeSystems'));
  beforeEach(module('sopheAuthorApp'));
  beforeEach(module('templates'));
  beforeEach(inject(function ($compile, $rootScope, $httpBackend) {
    this.compile = $compile;
    this.rootScope = $rootScope;
  }));

  it('defaults to the multi-display', function() {
    var element = angular.element('<code-systems></code-systems>');
    this.compile(element)(this.rootScope); // Compile the directive
    this.rootScope.$digest(); // Update the HTML
    expect(element.attr('id')).toBe('code-system-multi');
  });

  it('supports sidebar display', function() {
    var element = angular.element('<code-systems location="sidebar"></code-systems>');
    this.compile(element)(this.rootScope);
    this.rootScope.$digest();
    expect(element.attr('id')).toBe('code-system-sidebar');
  });
});