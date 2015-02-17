'use strict';

describe('Factory: FHIRElementService', function () {

  beforeEach(module('sophe.services.fhirElement'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_FHIRElementService_, _$http_, _$httpBackend_) {
    this.FHIRElementService = _FHIRElementService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.elementsGet = this.$httpBackend.when('GET', 'data/fhir-elements.json');
    this.elementsGet.respond({});
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      var promise = this.FHIRElementService.load();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('processes the elements', inject(function() {
      this.elementsGet.respond({
        results: {bindings: [
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/fhir/element#Immunization'
              },
              context: {
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/fhir/element#Immunization'
              },
              definition: {
                  type: 'literal',
                  value: 'Immunization description',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementLabel: {
                  type: 'literal',
                  value: 'Immunization',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'Immunization',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          },
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/fhir/element#Alert'
              },
              context: {
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/fhir/element#Alert'
              },
              definition: {
                  type: 'literal',
                  value: 'Alert description',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementLabel: {
                  type: 'literal',
                  value: 'Alert',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'Alert',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          }
      ]}});

      var dataElements = [];
      this.FHIRElementService.load()
        .then(this.FHIRElementService.processValues)
        .then(function(operators) { dataElements = operators; });
      this.$httpBackend.flush();
      expect(dataElements.length).toEqual(2);
      expect(dataElements[0].name).toEqual('Alert');
      expect(dataElements[0].description).toEqual('Alert description');
      expect(dataElements[0].id).toEqual('Alert');
    }));
  });
});