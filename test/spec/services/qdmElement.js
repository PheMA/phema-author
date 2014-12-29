'use strict';

describe('Factory: QDMElementService', function () {

  beforeEach(module('sophe.services.qdmElement'));

  var QDMElementService, $http, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_QDMElementService_, _$http_, _$httpBackend_) {
    QDMElementService = _QDMElementService_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      spyOn(QDMElementService, 'load').andCallFake(function() {
        return {
          success: function(callback) {
            callback({
              results: {bindings: []}}
            );
          }
        };
      });

      var promise = QDMElementService.load();
      expect(promise.success).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('processes the operators', inject(function() {
      $httpBackend.whenGET('data/qdm-categories.json').respond({
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

      $httpBackend.whenGET('data/qdm-elements.json').respond({
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
      QDMElementService.load()
        .then(QDMElementService.processValues)
        .then(function(operators) { dataElements = operators; });
      $httpBackend.flush();
      expect(dataElements.length).toEqual(2);
      expect(dataElements[0].name).toEqual('Test');
      expect(dataElements[0].children.length).toEqual(2);
      expect(dataElements[0].children[0].name).toEqual('Substance, Intolerance');
    }));
  });
});