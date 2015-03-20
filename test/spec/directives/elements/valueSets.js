'use strict';

describe('Directive: valueSets', function () {
  beforeEach(module('sophe.elements.valueSets'));
  beforeEach(module('sopheAuthorApp'));
  beforeEach(module('templates'));
  beforeEach(inject(function ($compile, $rootScope, $httpBackend) {
    this.compile = $compile;
    this.rootScope = $rootScope;
  }));

  it('defaults to the multi-display', function() {
    var element = angular.element('<value-sets selected-value-sets="temp"></value-sets>');
    this.compile(element)(this.rootScope); // Compile the directive
    this.rootScope.$digest(); // Update the HTML
    expect(element.attr('id')).toBe('value-set-multi');
  });

  it('supports single display', function() {
    var element = angular.element('<value-sets selected-value-sets="temp" allow-select="single"></value-sets>');
    this.compile(element)(this.rootScope); // Compile the directive
    this.rootScope.$digest(); // Update the HTML
    expect(element.attr('id')).toBe('value-set-single');
  });

  it('supports sidebar display', function() {
    var element = angular.element('<value-sets selected-value-sets="temp" location="sidebar"></value-sets>');
    this.compile(element)(this.rootScope);
    this.rootScope.$digest();
    expect(element.attr('id')).toBe('value-set-sidebar');
  });
});