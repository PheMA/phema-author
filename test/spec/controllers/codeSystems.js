'use strict';

describe('Controller: CodeSystemsController', function () {

  // load the controller's module
  beforeEach(module('sopheAuthorApp'));

  // Setup http mocks
  beforeEach(inject(function (_$http_, _$httpBackend_){
    this.$http = _$http_;
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
    scope.searchTerm = 'test';
    scope.$apply();
    this.$httpBackend.flush();
    $timeout.flush();
    // 1 result is returned 3 times (one for each code system)
    expect(scope.searchResults.length).toBe(3);
  }));
});
