'use strict';

describe('Factory: TemporalOperatorService', function () {

  beforeEach(module('sophe.services.temporalOperator'));

  var TemporalOperatorService, $http, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_TemporalOperatorService_, _$http_, _$httpBackend_) {
    TemporalOperatorService = _TemporalOperatorService_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      spyOn(TemporalOperatorService, 'load').andCallFake(function() {
        return {
          success: function(callback) {
            callback({
              results: {bindings: []}}
            );
          }
        };
      });

      var promise = TemporalOperatorService.load();
      expect(promise.success).toNotEqual(null);
    }));
  })

  describe('processValues', function() {
    it('processes the operators', inject(function() {
      $httpBackend.whenGET('data/qdm-temporalOperators.json').respond({
        results: {bindings: [
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#sbs'
              },
              context: {
                  type: "uri",
                  value: "http://rdf.healthit.gov/qdm/element#qdm"
              },
              temporalOperatorLabel: {
                  type: "literal",
                  value: "Start Before Start",
                  datatype: "http://www.w3.org/2001/XMLSchema#string"
              }
          },
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#sas'
              },
              context: {
                  type: "uri",
                  value: "http://rdf.healthit.gov/qdm/element#qdm"
              },
              temporalOperatorLabel: {
                  type: "literal",
                  value: "Start After Start",
                  datatype: "http://www.w3.org/2001/XMLSchema#string"
              }
          }
        ]}
      });

      var temporalOperators = [];
      TemporalOperatorService.load()
        .then(TemporalOperatorService.processValues)
        .then(function(operators) { temporalOperators = operators; });
      $httpBackend.flush();
      expect(temporalOperators.length).toEqual(2);
      expect(temporalOperators[0].name).toEqual('Start After Start');
    }));
  })
});