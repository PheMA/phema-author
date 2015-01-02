'use strict';

describe('Factory: QDMAttributeService', function () {

  beforeEach(module('sophe.services.qdmAttribute'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_QDMAttributeService_, _$http_, _$httpBackend_) {
    this.QDMAttributeService = _QDMAttributeService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.attributeGet = this.$httpBackend.when('GET', 'data/test-attribute_specificDatatype.json');
    this.attributeGet.respond([]);
  }));

  describe('loads return promises', function() {
    it('loadAll', inject(function() {
      var promise = this.QDMAttributeService.loadAll();
      expect(promise.then).toNotEqual(null);
    }));

    it('loadCategory', inject(function() {
      var promise = this.QDMAttributeService.loadCategory();
      expect(promise.then).toNotEqual(null);
    }));

    it('loadElement', inject(function() {
      var promise = this.QDMAttributeService.loadElement();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('processes the attributes', inject(function() {
      this.attributeGet.respond({
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

      var qdmAttributes = [];
      this.QDMAttributeService.loadAll()
        .then(this.QDMAttributeService.processValues)
        .then(function(attributes) { qdmAttributes = attributes; });
      this.$httpBackend.flush();
      expect(qdmAttributes.length).toEqual(1);
      expect(qdmAttributes[0].name).toEqual('Result');
      expect(qdmAttributes[0].type).toEqual('http://www.w3.org/2001/XMLSchema#string');
      expect(qdmAttributes[0].id).toEqual('Result');
    }));
  });

  describe('translateQDMToForm', function() {
    it('returns a text item for unknown attribute types', inject(function() {
      var formItem = this.QDMAttributeService.translateQDMToForm({id: 'Test', name: 'Test Item', type: 'unknown'});
      expect(formItem).toNotEqual(null);
      expect(formItem.type).toEqual('text');
      expect(formItem.label).toEqual('Test Item');
      expect(formItem.model).toEqual('Test');
    }));

    it('converts a date field', inject(function() {
      var formItem = this.QDMAttributeService.translateQDMToForm({id: 'Test', name: 'Test Item', type: 'http://www.w3.org/2001/XMLSchema#date'});
      expect(formItem.type).toEqual('date');
    }));

    it('converts a datetime field', inject(function() {
      var formItem = this.QDMAttributeService.translateQDMToForm({id: 'Test', name: 'Test Item', type: 'http://www.w3.org/2001/XMLSchema#dateTime'});
      expect(formItem.type).toEqual('datetime');
    }));

    it('converts a reason', inject(function() {
      var formItem = this.QDMAttributeService.translateQDMToForm({id: 'Reason', name: 'Test Item', type: 'http://www.w3.org/2001/XMLSchema#string'});
      expect(formItem.type).toEqual('select');
    }));
  });
});