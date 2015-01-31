angular.module('sophe.config', [])
.constant('environment', 'dev')
.constant('dataServiceBaseUrl', 'api/qdm/')
.constant('fhirServiceBaseUrl', 'api/fhir/')
.constant('libraryBaseUrl', 'api/library/')
.constant('valueSetServiceBaseUrl', 'api/valueset/');