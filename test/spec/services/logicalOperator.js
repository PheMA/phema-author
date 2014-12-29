'use strict';

describe('Factory: LogicalOperatorService', function () {

  beforeEach(module('sophe.services.logicalOperator'));

  var LogicalOperatorService, $http, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_LogicalOperatorService_, _$http_, _$httpBackend_) {
    LogicalOperatorService = _LogicalOperatorService_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      spyOn(LogicalOperatorService, 'load').andCallFake(function() {
        return {
          success: function(callback) {
            callback({
              results: {bindings: []}}
            );
          }
        };
      });

      var promise = LogicalOperatorService.load();
      expect(promise.success).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('processes the operators', inject(function() {
      $httpBackend.whenGET('data/qdm-logicalOperators.json').respond({
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
              logicalOperatorLabel: {
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
              logicalOperatorLabel: {
                  type: 'literal',
                  value: 'And',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          }
        ] }
      });

      var logicalOperators = [];
      LogicalOperatorService.load()
        .then(LogicalOperatorService.processValues)
        .then(function(operators) { logicalOperators = operators; });
      $httpBackend.flush();
      expect(logicalOperators.length).toEqual(2);
      expect(logicalOperators[0].name).toEqual('And');
    }));
  });
});