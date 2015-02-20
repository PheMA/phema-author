'use strict';

describe('Factory: FHIRElementService', function () {

  beforeEach(module('sophe.services.fhirElement', 'sophe.services.attribute'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_FHIRElementService_, _$http_, _$httpBackend_) {
    this.FHIRElementService = _FHIRElementService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.elementsGet = this.$httpBackend.when('GET', 'data/fhir-elements.json');
    this.elementsGet.respond({});
    this.attributesGet = this.$httpBackend.when('GET', 'data/fhir-attributes.json');
    this.attributesGet.respond({});
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



  describe('getAttributes', function() {
    it('returns values for category', inject(function() {
      this.attributesGet.respond({
        results: {bindings: [
        {"id":{"type":"uri","value":"http://rdf.hl7.org/fhir/fhir-0-4-0#ImagingStudy.modalityList"},
        "attributeLabel":{"type":"literal","value":"Modality List","datatype":"http://www.w3.org/2001/XMLSchema#string"},
        "context":{"type":"uri","value":"http://rdf.hl7.org/fhir/fhir-0-4-0#ImagingStudy"},
        "version":{"type":"uri","value":"http://rdf.hl7.org/fhir/fhir-0-4-0#fhir-0-4-0"},
        "definition":{"type":"literal","value":"A list of all the Series.ImageModality values that are actual acquisition modalities, i.e. those in the DICOM Context Group 29 (value set OID 1.2.840.10008.6.1.19).","datatype":"http://www.w3.org/2001/XMLSchema#string"},
        "dataElementDescription":{"type":"literal","value":"All series.modality if actual acquisition modalities","datatype":"http://www.w3.org/2001/XMLSchema#string"},
        "note":{},
        "dataElementLabel":{"type":"literal","value":"Modality List","datatype":"http://www.w3.org/2001/XMLSchema#string"},
        "dataElementName":{"type":"literal","value":"ImagingStudy.modalityList","datatype":"http://www.w3.org/2001/XMLSchema#string"},
        "cardinality":{"type":"literal","value":"0..*","datatype":"http://www.w3.org/2001/XMLSchema#string"},
        "cluster":{}},
        ] }
      });

      var attributes = null;
      this.FHIRElementService.getAttributes({type: 'Category', uri: 'http://rdf.healthit.gov/qdm/element#PhysicalExamPerformed'})
        .then(function(attrs) { attributes = attrs; });
      this.$httpBackend.flush();
      expect(attributes.length).toEqual(1);
      expect(attributes[0].id).toEqual('ImagingStudy.modalityList');
      expect(attributes[0].name).toEqual('Modality List');
    }));

    it('returns values for a datatype', inject(function() {
      this.attributesGet.respond({
        results: {bindings: [
          {"id":{"type":"uri","value":"http://rdf.hl7.org/fhir/fhir-0-4-0#ImagingStudy.modalityList"},
          "attributeLabel":{"type":"literal","value":"Modality List","datatype":"http://www.w3.org/2001/XMLSchema#string"},
          "context":{"type":"uri","value":"http://rdf.hl7.org/fhir/fhir-0-4-0#ImagingStudy"},
          "version":{"type":"uri","value":"http://rdf.hl7.org/fhir/fhir-0-4-0#fhir-0-4-0"},
          "definition":{"type":"literal","value":"A list of all the Series.ImageModality values that are actual acquisition modalities, i.e. those in the DICOM Context Group 29 (value set OID 1.2.840.10008.6.1.19).","datatype":"http://www.w3.org/2001/XMLSchema#string"},
          "dataElementDescription":{"type":"literal","value":"All series.modality if actual acquisition modalities","datatype":"http://www.w3.org/2001/XMLSchema#string"},
          "note":{},
          "dataElementLabel":{"type":"literal","value":"Modality List","datatype":"http://www.w3.org/2001/XMLSchema#string"},
          "dataElementName":{"type":"literal","value":"ImagingStudy.modalityList","datatype":"http://www.w3.org/2001/XMLSchema#string"},
          "cardinality":{"type":"literal","value":"0..*","datatype":"http://www.w3.org/2001/XMLSchema#string"},
          "cluster":{}},
        ] }
      });

      var attributes = null;
      this.FHIRElementService.getAttributes({type: 'DataElement', uri: 'http://rdf.healthit.gov/qdm/element#PhysicalExamPerformed'})
        .then(function(attrs) { attributes = attrs; });
      this.$httpBackend.flush();
      expect(attributes.length).toEqual(1);
      expect(attributes[0].id).toEqual('ImagingStudy.modalityList');
      expect(attributes[0].name).toEqual('Modality List');
    }));
  });
});