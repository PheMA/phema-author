'use strict';

describe('Factory: SubsetOperatorService', function () {

  beforeEach(module('sophe.services.subsetOperator'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_SubsetOperatorService_, _$http_, _$httpBackend_) {
    this.SubsetOperatorService = _SubsetOperatorService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.operatorGet = this.$httpBackend.when('GET', 'data/qdm-subsetOperators.json');
    this.operatorGet.respond({});
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      var promise = this.SubsetOperatorService.load();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('processes the operators', inject(function() {
      this.operatorGet.respond({
        results: {bindings: [
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#second'
              },
              context: {
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/qdm/element#second'
              },
              definition: {
                  type: 'literal',
                  value: 'Second description',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementLabel: {
                  type: 'literal',
                  value: 'Second',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'Second',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          },
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#first'
              },
              context: {
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/qdm/element#qdm'
              },
              definition: {
                  type: 'literal',
                  value: 'First description',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementLabel: {
                  type: 'literal',
                  value: 'First',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'First',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          }
        ] }
      });

      var subsetOperators = [];
      this.SubsetOperatorService.load()
        .then(this.SubsetOperatorService.processValues)
        .then(function(operators) { subsetOperators = operators; });
      this.$httpBackend.flush();
      expect(subsetOperators.length).toEqual(2);
      expect(subsetOperators[0].name).toEqual('First');
      expect(subsetOperators[0].description).toEqual('First description');
      expect(subsetOperators[0].id).toEqual('First');
    }));
  });
});