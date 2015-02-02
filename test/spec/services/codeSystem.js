'use strict';

describe('Factory: CodeSystemService', function () {

  beforeEach(module('sophe.services.codeSystem'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_CodeSystemService_, _$http_, _$httpBackend_) {
    this.CodeSystemService = _CodeSystemService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.codeSystemSearch = this.$httpBackend.when('GET', 'data/codeSystem-search.json');
    this.codeSystemSearch.respond({});
  }));

  describe('search', function() {
    it('returns a promise', inject(function() {
      var promise = this.CodeSystemService.search();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('returns an array', inject(function() {
      this.codeSystemSearch.respond({
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
      var codeSystems = [];
      this.CodeSystemService.search('test')
        .then(this.CodeSystemService.processValues)
        .then(function(vs) { codeSystems = vs; });
      this.$httpBackend.flush();
      expect(codeSystems.length).toEqual(1);
      expect(codeSystems[0].name).toEqual('Diabetes insipidus');
      expect(codeSystems[0].id).toEqual('253.5');
      expect(codeSystems[0].uri).toEqual('urn:oid:2.16.840.1.113883.6.2:253.5');
    }));
  });
});