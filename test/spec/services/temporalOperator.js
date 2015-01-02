'use strict';

describe('Factory: TemporalOperatorService', function () {

  beforeEach(module('sophe.services.temporalOperator'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_TemporalOperatorService_, _$http_, _$httpBackend_) {
    this.TemporalOperatorService = _TemporalOperatorService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.temporalOperatorsGet = this.$httpBackend.when('GET', 'data/qdm-temporalOperators.json');
    this.temporalOperatorsGet.respond({});
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      var promise = this.TemporalOperatorService.load();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('processes the operators', inject(function() {
      this.temporalOperatorsGet.respond({
        results: {bindings: [
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#sbs'
              },
              context: {
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/qdm/element#qdm'
              },
              temporalOperatorLabel: {
                  type: 'literal',
                  value: 'Start Before Start',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'SBS',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          },
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#sas'
              },
              context: {
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/qdm/element#qdm'
              },
              temporalOperatorLabel: {
                  type: 'literal',
                  value: 'Start After Start',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'SAS',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          }
        ]}
      });

      var temporalOperators = [];
      this.TemporalOperatorService.load()
        .then(this.TemporalOperatorService.processValues)
        .then(function(operators) { temporalOperators = operators; });
      this.$httpBackend.flush();
      expect(temporalOperators.length).toEqual(2);
      expect(temporalOperators[0].name).toEqual('Start After Start');
      expect(temporalOperators[0].id).toEqual('SAS');
    }));
  });
});