'use strict';

describe('Factory: QDMElementService', function () {

  beforeEach(module('sophe.services.qdmElement', 'sophe.services.qdmAttribute'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_QDMElementService_, _QDMAttributeService_, _$http_, _$httpBackend_) {
    this.QDMElementService = _QDMElementService_;
    this.QDMAttributeService = _QDMAttributeService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.categoryGet = this.$httpBackend.when('GET', 'data/qdm-categories.json');
    this.categoryGet.respond({});
    this.elementsGet = this.$httpBackend.when('GET', 'data/qdm-elements.json');
    this.elementsGet.respond({});
    this.attributesGet = this.$httpBackend.when('GET', 'data/test-attribute_specificDatatype.json');
    this.attributesGet.respond({});
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
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#qdm'
            },
            categoryLabel: {
                type: 'literal',
                value: 'Test 2',
                datatype: 'http://www.w3.org/2001/XMLSchema#string'
            },
            dataElementName: {
                type: 'literal',
                value: 'Test2',
                datatype: 'http://www.w3.org/2001/XMLSchema#string'
            }
        },
        {
            id: {
              type: 'uri',
              value: 'http://rdf.healthit.gov/qdm/element#TEST'
            },
            context: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#qdm'
            },
            categoryLabel: {
                type: 'literal',
                value: 'Test',
                datatype: 'http://www.w3.org/2001/XMLSchema#string'
            },
            dataElementName: {
                type: 'literal',
                value: 'TestId',
                datatype: 'http://www.w3.org/2001/XMLSchema#string'
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
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/qdm/element#TEST'
              },
              dataElementLabel: {
                  type: 'literal',
                  value: 'Substance, Tolerance',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'SubstanceTolerance',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          },
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#si'
              },
              context: {
                  type: 'uri',
                  value: 'http://rdf.healthit.gov/qdm/element#TEST'
              },
              dataElementLabel: {
                  type: 'literal',
                  value: 'Substance, Intolerance',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'SubstanceIntolerance',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
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
      expect(dataElements[0].id).toEqual('TestId');
      expect(dataElements[0].children.length).toEqual(2);
      expect(dataElements[0].children[0].name).toEqual('Substance, Intolerance');
      expect(dataElements[0].children[0].id).toEqual('SubstanceIntolerance');
    }));
  });

  describe('getAttributes', function() {
    it('returns values for category', inject(function() {
      this.attributesGet.respond({
        results: {bindings: [
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#PhysicalExamPerformed.Result'
              },
              attributeLabel: {
                  type: 'literal',
                  value: 'Result',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'Result',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          }
        ] }
      });

      var attributes = null;
      this.QDMElementService.getAttributes({type: 'Category', uri: 'http://rdf.healthit.gov/qdm/element#PhysicalExamPerformed'})
        .then(function(attrs) { attributes = attrs; });
      this.$httpBackend.flush();
      expect(attributes.length).toEqual(1);
      expect(attributes[0].id).toEqual('Result');
      expect(attributes[0].name).toEqual('Result');
    }));

    it('returns values for an element', inject(function() {
      this.attributesGet.respond({
        results: {bindings: [
          {
              id: {
                type: 'uri',
                value: 'http://rdf.healthit.gov/qdm/element#PhysicalExamPerformed.Result'
              },
              attributeLabel: {
                  type: 'literal',
                  value: 'Result',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              },
              dataElementName: {
                  type: 'literal',
                  value: 'Result',
                  datatype: 'http://www.w3.org/2001/XMLSchema#string'
              }
          }
        ] }
      });

      var attributes = null;
      this.QDMElementService.getAttributes({type: 'DataElement', uri: 'http://rdf.healthit.gov/qdm/element#PhysicalExamPerformed'})
        .then(function(attrs) { attributes = attrs; });
      this.$httpBackend.flush();
      expect(attributes.length).toEqual(1);
      expect(attributes[0].id).toEqual('Result');
      expect(attributes[0].name).toEqual('Result');
    }));
  });
});