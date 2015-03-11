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
    this.valueSetDetailsGet = this.$httpBackend.when('GET', 'data/valueSet-members.json');
    this.valueSetDetailsGet.respond({});
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

  describe('formatDescription', function() {
    it ('returns a default value when empty', inject(function() {
      expect(this.ValueSetService.formatDescription(null)).toEqual('Loading...');
    }));
    it ('returns a default value when not loaded', inject(function() {
      expect(this.ValueSetService.formatDescription({loadDetailStatus: null})).toEqual('Loading...');
    }));
    it ('returns a special message when loading fails', inject(function() {
      expect(this.ValueSetService.formatDescription({loadDetailStatus: 'error'})).toEqual('There was an error loading the details of this value set.  Please try again in a little bit, or contact us if the problem continues.');
    }));
    it ('returns a special message when the value set is empty', inject(function() {
      expect(this.ValueSetService.formatDescription({loadDetailStatus: 'success', members: []})).toEqual('(There are no codes in this value set)');
    }));
    it ('formats the description for a single code system and code', inject(function() {
      expect(this.ValueSetService.formatDescription(
        {
          loadDetailStatus: 'success',
          codeSystems: ['ICD9CM'],
          members: [
            {
              code: '123',
              name: 'Test Code'
            }
          ]
        }
        )).toEqual('Code system(s) used: ICD9CM\r\nCodes:\r\n (123) Test Code\r\n');
    }));
    it ('formats the description for multiple code systems and codes', inject(function() {
      expect(this.ValueSetService.formatDescription(
        {
          loadDetailStatus: 'success',
          codeSystems: ['ICD9CM', 'SNOMEDCT'],
          members: [
            {
              code: '123',
              name: 'Test Code'
            },
            {
              code: '234',
              name: 'Test Code 2'
            },
            {
              code: '345',
              name: 'Test Code 3'
            },
            {
              code: '456',
              name: 'Test Code 4'
            }
          ]
        }
        )).toEqual('Code system(s) used: ICD9CM, SNOMEDCT\r\nCodes: (first 3 of 4)\r\n (123) Test Code\r\n (234) Test Code 2\r\n (345) Test Code 3\r\n');
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
      expect(valueSets[1].loadDetailStatus).toEqual(null);
      expect(valueSets[1].codeSystems.length).toEqual(0);
      expect(valueSets[1].members.length).toEqual(0);
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
      this.ValueSetService.loadSingle('id')
        .then(this.ValueSetService.processSingleValue)
        .then(function(vs) { valueSet = vs; });
      this.$httpBackend.flush();
      expect(valueSet.name).toEqual('Acute Lymphadenitis');
      expect(valueSet.id).toEqual('2.16.840.1.113883.3.464.1003.199.11.1005');
      expect(valueSet.uri).toEqual('urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005/version/20140501');
      expect(valueSet.loadDetailStatus).toEqual(null);
      expect(valueSet.codeSystems.length).toEqual(0);
      expect(valueSet.members.length).toEqual(0);
    }));
  });

  it('returns details for a single value set', inject(function() {
      this.valueSetDetailsGet.respond(
        {
          'iteratableResolvedValueSet': {
            'resolutionInfo': {
              'resolutionOf': {
                'valueSetDefinition': {
                  'content': '20140501',
                  'uri': 'urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005/version/20140501',
                  'href': 'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.199.11.1005/definition/20140501'
                },
                'valueSet': {
                  'content': '2.16.840.1.113883.3.464.1003.199.11.1005',
                  'uri': 'urn:oid:2.16.840.1.113883.3.464.1003.199.11.1005',
                  'href': 'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.199.11.1005'
                }
              },
              'resolvedUsingCodeSystemList': [
                {
                  'version': {
                    'content': 'ICD9CM-2013'
                  },
                  'codeSystem': {
                    'content': 'ICD9CM',
                    'uri': 'http://id.nlm.nih.gov/cui/C1137112'
                  }
                }
              ]
            },
            'entryList': [
              {
                'designation': 'Acute lymphadenitis',
                'uri': 'http://id.nlm.nih.gov/cui/C1137112/683',
                'href': 'https://informatics.mayo.edu/vsmc/cts2/codesystem/ICD9CM/version/ICD9CM-2013/entity/683',
                'namespace': 'ICD9CM',
                'name': '683'
              }
            ],
            'complete': 'COMPLETE',
            'numEntries': 1,
            'heading': {
              'resourceRoot': 'valueset/2.16.840.1.113883.3.464.1003.199.11.1005/definition/20140501/resolution',
              'resourceURI': 'https://informatics.mayo.edu/vsmc/cts2/valueset/2.16.840.1.113883.3.464.1003.199.11.1005/definition/20140501/resolution',
              'parameterList': [
                {
                  'arg': 'format',
                  'val': 'json'
                }
              ],
              'accessDate': 'Mar 10, 2015 9:42:25 AM'
            }
          }
        }
      );

      var details = null;
      this.ValueSetService.loadDetails('id')
        .then(this.ValueSetService.processDetails)
        .then(function(det) { details = det; });
      this.$httpBackend.flush();
      expect(details.codeSystems.length).toEqual(1);
      expect(details.codeSystems[0]).toEqual('ICD9CM');
      expect(details.members.length).toEqual(1);
      expect(details.members[0].codeset).toEqual('ICD9CM');
      expect(details.members[0].code).toEqual('683');
      expect(details.members[0].name).toEqual('Acute lymphadenitis');
      expect(details.members[0].uri).toEqual('http://id.nlm.nih.gov/cui/C1137112/683');
      expect(details.members[0].type).toEqual('Term');
  }));
});