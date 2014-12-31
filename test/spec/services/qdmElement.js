'use strict';

describe('Factory: QDMElementService', function () {

  beforeEach(module('sophe.services.qdmElement'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_QDMElementService_, _$http_, _$httpBackend_) {
    this.QDMElementService = _QDMElementService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.categoryGet = this.$httpBackend.when('GET', 'data/qdm-categories.json');
    this.categoryGet.respond([]);
    this.elementsGet = this.$httpBackend.when('GET', 'data/qdm-elements.json');
    this.elementsGet.respond([]);
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      var promise = this.QDMElementService.load();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('processes the operators', inject(function() {
      this.categoryGet.respond({
        results: {bindings: [
          {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#TEST2'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#qdm"
            },
            categoryLabel: {
                type: "literal",
                value: "Test 2",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        },
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#TEST'
            },
            context: {
                type: "uri",
                value: "http://rdf.healthit.gov/qdm/element#qdm"
            },
            categoryLabel: {
                type: "literal",
                value: "Test",
                datatype: "http://www.w3.org/2001/XMLSchema#string"
            }
        }
      ]}});

      this.elementsGet.respond({
        results: {bindings: [
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#st'
              },
              context: {
                  type: "uri",
                  value: "http://rdf.healthit.gov/qdm/element#TEST"
              },
              dataElementLabel: {
                  type: "literal",
                  value: "Substance, Tolerance",
                  datatype: "http://www.w3.org/2001/XMLSchema#string"
              }
          },
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#si'
              },
              context: {
                  type: "uri",
                  value: "http://rdf.healthit.gov/qdm/element#TEST"
              },
              dataElementLabel: {
                  type: "literal",
                  value: "Substance, Intolerance",
                  datatype: "http://www.w3.org/2001/XMLSchema#string"
              }
          }
      ]}});

      var dataElements = [];
      this.QDMElementService.load()
        .then(this.QDMElementService.processValues)
        .then(function(operators) { dataElements = operators; });
      this.$httpBackend.flush();
      expect(dataElements.length).toEqual(2);
      expect(dataElements[0].name).toEqual('Test');
      expect(dataElements[0].children.length).toEqual(2);
      expect(dataElements[0].children[0].name).toEqual('Substance, Intolerance');
    }));
  });
});