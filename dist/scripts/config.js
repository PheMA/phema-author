angular.module('sophe.config', [])
.constant('environment', 'dev')
.constant('dataServiceBaseUrl', 'api/qdm/')
.constant('fhirServiceBaseUrl', 'api/fhir/')
.constant('libraryBaseUrl', 'api/library/')
.constant('valueSetServiceBaseUrl', 'api/valueset/')
.constant('codeSystemServiceBaseUrl', 'api/codesystem/')
.constant('configServiceBaseUrl', 'api/config/')
.constant('exporterServiceBaseUrl', 'api/export/')
.constant('unitServiceBaseUrl', 'api/units/')

// Authorization specific constants
.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
;