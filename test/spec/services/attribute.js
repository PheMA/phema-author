'use strict';

describe('Factory: AttributeService', function () {

  beforeEach(module('sophe.services.attribute'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_AttributeService_, _$http_, _$httpBackend_) {
    this.AttributeService = _AttributeService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.qdmAttributeGet = this.$httpBackend.when('GET', 'data/test-attribute_specificDatatype.json');
    this.qdmAttributeGet.respond([]);
    this.fhirAttributeGet = this.$httpBackend.when('GET', 'data/fhir-attributes.json');
    this.fhirAttributeGet.respond([]);
  }));

  describe('loads return promises', function() {
    it('loadAll', inject(function() {
      var promise = this.AttributeService.loadAll();
      expect(promise.then).toNotEqual(null);
    }));

    it('loadCategory', inject(function() {
      var promise = this.AttributeService.loadCategory();
      expect(promise.then).toNotEqual(null);
    }));

    it('loadElement', inject(function() {
      var promise = this.AttributeService.loadElement();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('processes QDM attributes', inject(function() {
      this.qdmAttributeGet.respond({
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
      this.AttributeService.loadAll()
        .then(this.AttributeService.processValues)
        .then(function(attributes) { qdmAttributes = attributes; });
      this.$httpBackend.flush();
      expect(qdmAttributes.length).toEqual(1);
      expect(qdmAttributes[0].name).toEqual('Result');
      expect(qdmAttributes[0].type).toEqual('http://www.w3.org/2001/XMLSchema#string');
      expect(qdmAttributes[0].id).toEqual('Result');
    }));

    it('processes and filters FHIR attributes', inject(function() {
      this.fhirAttributeGet.respond({
        results: {bindings: [
          {'id':{'type':'uri','value':'http://rdf.hl7.org/fhir/fhir-0-4-0#ImagingStudy.uid'},
            'attributeLabel':{'type':'literal','value':'Uid','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'context':{'type':'uri','value':'http://rdf.hl7.org/fhir/fhir-0-4-0#ImagingStudy'},
            'version':{'type':'uri','value':'http://rdf.hl7.org/fhir/fhir-0-4-0#fhir-0-4-0'},
            'definition':{'type':'literal','value':'Formal identifier for the study.','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'dataElementDescription':{'type':'literal','value':'Formal identifier for the study (0020,000D)','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'note':{},
            'dataElementLabel':{'type':'literal','value':'Uid','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'dataElementName':{'type':'literal','value':'ImagingStudy.uid','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'cardinality':{'type':'literal','value':'1..1','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'cluster':{}
          },
          {'id':{'type':'uri','value':'http://rdf.hl7.org/fhir/fhir-0-4-0#ImagingStudy.series'},
            'attributeLabel':{'type':'literal','value':'Series','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'context':{'type':'uri','value':'http://rdf.hl7.org/fhir/fhir-0-4-0#ImagingStudy'},
            'version':{'type':'uri','value':'http://rdf.hl7.org/fhir/fhir-0-4-0#fhir-0-4-0'},
            'definition':{'type':'literal','value':'Each study has one or more series of image instances.','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'dataElementDescription':{'type':'literal','value':'Each study has one or more series of instances','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'note':{},
            'dataElementLabel':{'type':'literal','value':'Series','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'dataElementName':{'type':'literal','value':'ImagingStudy.series','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'cardinality':{'type':'literal','value':'0..*','datatype':'http://www.w3.org/2001/XMLSchema#string'},
            'cluster':{'type':'uri','value':'http://rdf.hl7.org/fhir/schema#Cluster'}
          }
        ] }
      });

      var fhirAttributes = [];
      this.AttributeService.loadAll('fhir')
        .then(this.AttributeService.processValues)
        .then(function(attributes) { fhirAttributes = attributes; });
      this.$httpBackend.flush();
      expect(fhirAttributes.length).toEqual(1);
      expect(fhirAttributes[0].name).toEqual('Series');
      expect(fhirAttributes[0].type).toEqual('http://www.w3.org/2001/XMLSchema#string');
      expect(fhirAttributes[0].id).toEqual('ImagingStudy.series');
    }));
  });

  describe('translateQDMToForm', function() {
    it('returns a text item for unknown attribute types', inject(function() {
      var formItem = this.AttributeService.translateQDMToForm({id: 'Test', name: 'Test Item', type: 'unknown'});
      expect(formItem).toNotEqual(null);
      expect(formItem.type).toEqual('text');
      expect(formItem.label).toEqual('Test Item');
      expect(formItem.model).toEqual('Test');
    }));

    it('converts a date field', inject(function() {
      var formItem = this.AttributeService.translateQDMToForm({id: 'Test', name: 'Test Item', type: 'http://www.w3.org/2001/XMLSchema#date'});
      expect(formItem.type).toEqual('date');
    }));

    it('converts a datetime field', inject(function() {
      var formItem = this.AttributeService.translateQDMToForm({id: 'Test', name: 'Test Item', type: 'http://www.w3.org/2001/XMLSchema#dateTime'});
      expect(formItem.type).toEqual('datetime');
    }));

    it('converts a reason', inject(function() {
      var formItem = this.AttributeService.translateQDMToForm({id: 'Reason', name: 'Test Item', type: 'http://www.w3.org/2001/XMLSchema#string'});
      expect(formItem.type).toEqual('valueSet');
    }));
  });
});