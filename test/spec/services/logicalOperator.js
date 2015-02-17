'use strict';

describe('Factory: LogicalOperatorService', function () {

  beforeEach(module('sophe.services.logicalOperator'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_LogicalOperatorService_, _$http_, _$httpBackend_) {
    this.LogicalOperatorService = _LogicalOperatorService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.operatorGet = this.$httpBackend.when('GET', 'data/qdm-logicalOperators.json');
    this.operatorGet.respond({});
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      var promise = this.LogicalOperatorService.load();
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
                value: 'http://rdf.healthit.gov/qdm/element#or'
              },
              context: {
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/qdm/element#qdm'
              },
              definition: {
                  type: 'literal',
                  value: 'Or description',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              logicalOperatorLabel: {
                  type: 'literal',
                  value: 'Or',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'Or',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          },
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#and'
              },
              context: {
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/qdm/element#qdm'
              },
              definition: {
                  type: 'literal',
                  value: 'And description',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              logicalOperatorLabel: {
                  type: 'literal',
                  value: 'And',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'And',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          }
        ] }
      });

      var logicalOperators = [];
      this.LogicalOperatorService.load()
        .then(this.LogicalOperatorService.processValues)
        .then(function(operators) { logicalOperators = operators; });
      this.$httpBackend.flush();
      expect(logicalOperators.length).toEqual(2);
      expect(logicalOperators[0].name).toEqual('And');
      expect(logicalOperators[0].description).toEqual('And description');
      expect(logicalOperators[0].id).toEqual('And');
    }));
  });
});