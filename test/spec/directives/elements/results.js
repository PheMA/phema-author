'use strict';

describe('Directive: results', function () {
  beforeEach(module('sophe.elements.results'));
  beforeEach(module('sopheAuthorApp'));
  beforeEach(module('templates'));
  beforeEach(inject(function ($compile, $rootScope, _$httpBackend_) {
    this.httpBackend = _$httpBackend_;
    this.compile = $compile;
    this.rootScope = $rootScope;
    this.unitsGet = this.httpBackend.when('GET', 'data/units.json');
    this.unitsGet.respond([]);
  }));

  it('converts the directive to html', function() {
    var element = angular.element('<results result="{}"></results>');
    this.compile(element)(this.rootScope); // Compile the directive
    this.rootScope.$digest(); // Update the HTML
    expect(element.attr('class')).toBe('results-container ng-isolate-scope');
  });
  
  it('loads the units into the list', function() {
    this.unitsGet.respond([
      {"code":"test1", "value":"test 1"},
      {"code":"test2", "value":"test 2"},
    ]);
    
    var element = angular.element('<results result="{}"></results>');
    var scope = this.rootScope.$new();
    this.compile(element)(scope); // Compile the directive
    this.httpBackend.flush();
    scope.$apply(); // Update the HTML
    expect(element.isolateScope().units.length).toBe(2);
  });
});