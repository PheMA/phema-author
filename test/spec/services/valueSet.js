'use strict';

describe('Factory: ValueSetService', function () {

  beforeEach(module('sophe.services.valueSet'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_ValueSetService_, _$http_, _$httpBackend_) {
    this.ValueSetService = _ValueSetService_;
    this.$http = _$http_;
    this.$httpBackend = _$httpBackend_;
    this.valueSetsGet = this.$httpBackend.when('GET', 'data/valueSets.json');
    this.valueSetsGet.respond({});
    this.valueSetGet = this.$httpBackend.when('GET', 'data/valueSet.json');
    this.valueSetGet.respond({});
  }));

  describe('load', function() {
    it('returns a promise', inject(function() {
      var promise = this.ValueSetService.load();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('search', function() {
    it('returns a promise', inject(function() {
      var promise = this.ValueSetService.search();
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('loadDetails', function() {
    it('returns a promise', inject(function() {
      var promise = this.ValueSetService.loadDetails('1');
      this.$httpBackend.flush();
      expect(promise.then).toNotEqual(null);
    }));
  });

  describe('processValues', function() {
    it('returns an array', inject(function() {
      this.valueSetsGet.respond(
        {
          'valueSetCatalogEntryDirectory':
            {
              'entryList': [
                {
                  'valueSetName':'2.16.840.1.113883.3.464.1003.199.11.1005',
                  'currentDefinition': {
                    'valueSetDefinition': {
                      'content':'20140501',
                      'uri':'urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005/version/20140501',
                      'href':'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.199.11.1005/definition/20140501'
                    },
                    'valueSet': {
                      'content': '2.16.840.1.113883.3.464.1003.199.11.1005',
                      'uri': 'urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005',
                      'href':'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.199.11.1005'
                    }
                  },
                  'about': 'urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005',
                  'formalName':'Acute Lymphadenitis',
                  'resourceSynopsis': {
                    'value':'Acute Lymphadenitis'
                  },
                  'href': 'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.199.11.1005',
                  'resourceName':'2.16.840.1.113883.3.464.1003.199.11.1005'
                },
                {
                  'valueSetName':'2.16.840.1.113883.3.464.1003.102.12.1012',
                  'currentDefinition': {
                    'valueSetDefinition': {
                      'content':'20140501',
                      'uri':'urn:oid:2.16.840.1.113883.3.464.1003.102.12.1012/version/20140501',
                      'href':'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.102.12.1012/definition/20140501'
                    },
                    'valueSet': {
                      'content':'2.16.840.1.113883.3.464.1003.102.12.1012',
                      'uri': 'urn:oid:2.16.840.1.113883.3.464.1003.102.12.1012',
                      'href':'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.102.12.1012'
                    }
                  },
                  'about':'urn:oid:2.16.840.1.113883.3.464.1003.102.12.1012',
                  'formalName':'Acute Tonsillitis',
                  'resourceSynopsis': {
                    'value':'Acute Tonsillitis'
                  },
                  'href':'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.102.12.1012',
                  'resourceName':'2.16.840.1.113883.3.464.1003.102.12.1012'
                }
              ]
            }
        });
      var valueSets = [];
      this.ValueSetService.load()
        .then(this.ValueSetService.processValues)
        .then(function(vs) { valueSets = vs; });
      this.$httpBackend.flush();
      expect(valueSets.length).toEqual(2);
      expect(valueSets[1].name).toEqual('Acute Tonsillitis');
      expect(valueSets[1].id).toEqual('2.16.840.1.113883.3.464.1003.102.12.1012');
      expect(valueSets[1].uri).toEqual('urn:oid:2.16.840.1.113883.3.464.1003.102.12.1012/version/20140501');
    }));

    it('returns a single value', inject(function() {
      this.valueSetGet.respond(
        {
          'valueSetDefinitionMsg': {
            'valueSetDefinition': {
              'definedValueSet': {
                'content': '2.16.840.1.113883.3.464.1003.199.11.1005',
                'uri': 'urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005',
                'href': 'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.199.11.1005'
              },
              'entryList': [
                {
                  'operator': 'UNION',
                  'entryOrder': 1,
                  'entityList': {
                    'referencedEntityList': [
                      {
                        'uri': 'http://id.nlm.nih.gov/cui/C1137112/683',
                        'href': 'https://informatics.mayo.edu/vsmc/cts2/codesystem/ICD9CM/version/ICD9CM-2013/entity/683',
                        'namespace': 'ICD9CM',
                        'name': '683'
                      }
                    ]
                  }
                }
              ],
              'documentURI': 'urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005/version/20140501',
              'state': 'FINAL',
              'sourceAndNotation': {
                'sourceAndNotationDescription': 'MAT Authoring Tool Output Zip.'
              },
              'about': 'urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005',
              'formalName': 'Acute Lymphadenitis',
              'resourceSynopsis': {
                'value': 'Acute Lymphadenitis'
              },
              'entryState': 'ACTIVE'
            },
            'heading': {
              'resourceRoot': 'valueset/2.16.840.1.113883.3.464.1003.199.11.1005/definition/20140501',
              'resourceURI': 'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.199.11.1005/definition/20140501',
              'parameterList': [
                {
                  'arg': 'format',
                  'val': 'json'
                }
              ],
              'accessDate': 'Jan 22, 2015 9:49:58 AM'
            }
          }
        });
      var valueSet = null;
      this.ValueSetService.loadDetails('id')
        .then(this.ValueSetService.processSingleValue)
        .then(function(vs) { valueSet = vs; });
      this.$httpBackend.flush();
      expect(valueSet.name).toEqual('Acute Lymphadenitis');
      expect(valueSet.id).toEqual('2.16.840.1.113883.3.464.1003.199.11.1005');
      expect(valueSet.uri).toEqual('urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005/version/20140501');
    }));
  });
});