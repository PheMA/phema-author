'use strict';

describe('Directive: valueSets', function () {
  beforeEach(module('sophe.elements.valueSets'));
  beforeEach(inject(function ($compile, $rootScope) {
    var linkingFn = $compile('<value-sets></value-sets>');
    this.scope = $rootScope;
    this.element = linkingFn(scope);
  }));

//   it('has some properties', function() {
//     expect(element.someMethod()).toBe(XXX);
//   });

//   it('does something to the scope', function() {
//     expect(scope.someField).toBe('XXX');
// ￼￼});
});