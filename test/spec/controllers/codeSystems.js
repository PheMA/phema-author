'use strict';

describe('Controller: CodeSystemsController', function () {

  // load the controller's module
  beforeEach(module('sopheAuthorApp'));

  // Setup http mocks
  beforeEach(inject(function (_$httpBackend_){
    this.$httpBackend = _$httpBackend_;
    this.codeSystemSearch = this.$httpBackend.when('GET', 'data/codeSystem-search.json');
    this.codeSystemSearch.respond({});
  }));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    this.scope = $rootScope.$new();
    this.controller = $controller('CodeSystemsController', {
      $scope: this.scope
    });
  }));

  it('should process a search', inject(function ($timeout) {
    this.codeSystemSearch.respond(
    {
      "EntityDirectory": {
        "entry": [
          {
            "about": "urn:oid:2.16.840.1.113883.6.2:253.5",
            "name": {
              "namespace": "ICD-9-CM",
              "name": "253.5"
            },
            "knownEntityDescription": [
              {
                "href": "http://lexevs62cts2.nci.nih.gov/lexevscts2/codesystem/ICD-9-CM/version/2013_2012_08_06/entity/253.5",
                "describingCodeSystemVersion": {
                  "version": {
                    "content": "ICD-9-CM-2013_2012_08_06",
                    "href": "http://lexevs62cts2.nci.nih.gov/lexevscts2/codesystem/ICD-9-CM/version/2013_2012_08_06"
                  },
                  "codeSystem": {
                    "content": "ICD-9-CM",
                    "uri": "urn:oid:2.16.840.1.113883.6.2"
                  }
                },
                "designation": "Diabetes insipidus"
              }
            ]
          }
        ]
      }
    });

    var scope = this.scope;
    scope.search.term = 'test';
    scope.$apply();
    this.$httpBackend.flush();
    $timeout.flush();
    // 1 result is returned 3 times (one for each code system)
    expect(scope.search.results.length).toBe(3);
    expect(scope.search.results[0].id).toBe('ICD-9-CM');
    expect(scope.search.results[1].id).toBe('ICD-10');
    expect(scope.search.results[2].id).toBe('LOINC');
  }));
});
